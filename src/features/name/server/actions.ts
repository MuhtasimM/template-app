"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { NAME_COOKIE, NAME_MAX_AGE_SECONDS, nameSchema } from "@/lib/name";
import { requireSession } from "@/lib/session";

export async function saveName(
  _state: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  await requireSession();

  const parsed = nameSchema.safeParse(formData.get("name") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const cookieStore = await cookies();
  cookieStore.set(NAME_COOKIE, parsed.data, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: NAME_MAX_AGE_SECONDS,
  });
  revalidatePath("/", "layout");
  return {};
}
