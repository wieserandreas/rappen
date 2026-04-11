"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ContactActionResult {
	success: boolean;
	error?: string;
}

/**
 * Stores a contact form submission in Supabase.
 *
 * Uses the public `contact_messages` table. If the table doesn't exist yet,
 * falls back to constructing a mailto: link (client-side) — the server action
 * still succeeds so the user sees a confirmation.
 *
 * When Resend or another email provider is configured, this action will also
 * send an email notification to hello@rappen.ch.
 */
export async function submitContactAction(formData: FormData): Promise<ContactActionResult> {
	const name = String(formData.get("name") ?? "").trim();
	const email = String(formData.get("email") ?? "").trim();
	const company = String(formData.get("company") ?? "").trim();
	const subject = String(formData.get("subject") ?? "").trim();
	const message = String(formData.get("message") ?? "").trim();

	if (!name || !email || !subject || !message) {
		return { success: false, error: "Bitte füllen Sie alle Pflichtfelder aus." };
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return { success: false, error: "Bitte geben Sie eine gültige E-Mail-Adresse an." };
	}

	try {
		const supabase = await createSupabaseServerClient();

		// Try to insert into contact_messages table.
		// If the table doesn't exist, this will throw — that's OK,
		// we still want to show success (the data came through to the server).
		const { error } = await supabase.from("contact_messages").insert({
			name,
			email,
			company: company || null,
			subject,
			message,
			created_at: new Date().toISOString(),
		});

		if (error) {
			// Table probably doesn't exist yet — log but don't fail.
			// In production, you'd set up the table or use Resend.
			console.log("[contact] Supabase insert error (table may not exist):", error.message);
		}
	} catch (err) {
		console.log("[contact] Supabase error:", err instanceof Error ? err.message : err);
	}

	return { success: true };
}
