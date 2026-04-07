"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthActionResult {
	success: boolean;
	error?: string;
	fieldErrors?: Record<string, string>;
}

const loginSchema = z.object({
	email: z.string().email("Bitte eine gültige E-Mail-Adresse angeben."),
	password: z.string().min(1, "Bitte das Passwort eingeben."),
});

const registerSchema = z
	.object({
		email: z.string().email("Bitte eine gültige E-Mail-Adresse angeben."),
		password: z
			.string()
			.min(8, "Mindestens 8 Zeichen.")
			.regex(/[A-Z]/, "Mindestens ein Grossbuchstabe.")
			.regex(/[a-z]/, "Mindestens ein Kleinbuchstabe.")
			.regex(/[0-9]/, "Mindestens eine Ziffer."),
		password_confirm: z.string(),
		company: z.string().min(2, "Bitte den Firmennamen angeben."),
		accept_terms: z.literal("on", {
			errorMap: () => ({ message: "Bitte AGB und Datenschutz akzeptieren." }),
		}),
	})
	.refine((data) => data.password === data.password_confirm, {
		message: "Die Passwörter stimmen nicht überein.",
		path: ["password_confirm"],
	});

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
	const out: Record<string, string> = {};
	for (const issue of error.issues) {
		const path = issue.path.join(".");
		if (path && !out[path]) {
			out[path] = issue.message;
		}
	}
	return out;
}

// ════════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════════
export async function loginAction(formData: FormData): Promise<AuthActionResult> {
	const parsed = loginSchema.safeParse({
		email: String(formData.get("email") ?? "").trim(),
		password: String(formData.get("password") ?? ""),
	});

	if (!parsed.success) {
		return {
			success: false,
			error: "Bitte überprüfen Sie die Eingaben.",
			fieldErrors: fieldErrorsFromZod(parsed.error),
		};
	}

	const supabase = await createSupabaseServerClient();
	const { error } = await supabase.auth.signInWithPassword({
		email: parsed.data.email,
		password: parsed.data.password,
	});

	if (error) {
		return {
			success: false,
			error:
				error.message === "Invalid login credentials"
					? "E-Mail oder Passwort ist falsch."
					: error.message,
		};
	}

	revalidatePath("/", "layout");
	const next = String(formData.get("next") ?? "/dashboard");
	redirect(next.startsWith("/") ? next : "/dashboard");
}

// ════════════════════════════════════════════════════════════════
// REGISTER
// ════════════════════════════════════════════════════════════════
export async function registerAction(formData: FormData): Promise<AuthActionResult> {
	const parsed = registerSchema.safeParse({
		email: String(formData.get("email") ?? "").trim(),
		password: String(formData.get("password") ?? ""),
		password_confirm: String(formData.get("password_confirm") ?? ""),
		company: String(formData.get("company") ?? "").trim(),
		accept_terms: formData.get("accept_terms"),
	});

	if (!parsed.success) {
		return {
			success: false,
			error: "Bitte überprüfen Sie die Eingaben.",
			fieldErrors: fieldErrorsFromZod(parsed.error),
		};
	}

	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.auth.signUp({
		email: parsed.data.email,
		password: parsed.data.password,
		options: {
			data: {
				company: parsed.data.company,
				plan: "free",
			},
		},
	});

	if (error) {
		return {
			success: false,
			error:
				error.message === "User already registered"
					? "Diese E-Mail-Adresse ist bereits registriert."
					: error.message,
		};
	}

	// If email confirmation is enabled, no session yet — show success message.
	if (!data.session) {
		return {
			success: true,
			error: "EMAIL_CONFIRMATION_REQUIRED",
		};
	}

	revalidatePath("/", "layout");
	redirect("/dashboard");
}

// ════════════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════════════
export async function logoutAction() {
	const supabase = await createSupabaseServerClient();
	await supabase.auth.signOut();
	revalidatePath("/", "layout");
	redirect("/");
}
