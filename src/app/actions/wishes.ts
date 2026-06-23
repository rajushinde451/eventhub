"use server";

import { createClient } from "@/lib/supabase/server";
import { wishSchema } from "@/lib/validations";
import type { ActionResult, Wish } from "@/types";

export async function submitWish(
  eventId: string,
  formData: { name: string; message: string }
): Promise<ActionResult<{ id: string }>> {
  const parsed = wishSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishes")
    .insert({
      event_id: eventId,
      name: parsed.data.name,
      message: parsed.data.message,
      approved: true,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { data: { id: data.id } };
}

export async function getEventWishes(eventId: string, showAll = false): Promise<Wish[]> {
  const supabase = await createClient();
  let query = supabase
    .from("wishes")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (!showAll) {
    query = query.eq("approved", true);
  }

  const { data } = await query;
  return (data as Wish[]) || [];
}

export async function moderateWish(
  wishId: string,
  approved: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("wishes")
    .update({ approved })
    .eq("id", wishId);

  if (error) return { error: error.message };
  return { data: undefined };
}

export async function deleteWish(wishId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("wishes")
    .delete()
    .eq("id", wishId);

  if (error) return { error: error.message };
  return { data: undefined };
}
