"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client (browser only).
 * Reads the current session from cookies.
 */
export function createSupabaseBrowserClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}
