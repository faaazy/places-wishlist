import { supabase } from "@/shared/lib/supabase";

export async function createUserProfile(id: string, name: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!error) return data;

  if (error.code === "PGRST116") {
    const { data: created, error: insertError } = await supabase
      .from("users")
      .insert({ id, name })
      .select()
      .single();

    if (insertError) {
      console.error("createUserProfile failed:", insertError);
      throw insertError;
    }
    return created;
  }

  console.error("createUserProfile unexpected error:", error);
  throw error;
}
