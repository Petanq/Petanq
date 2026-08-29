"use server";

import { isAdmin } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import type { AppState } from "@/lib/match13/state";

export interface Match13ArchiefRij {
  id: string;
  club: string;
  reden: string;
  gearchiveerd_op: string;
}

export interface Match13ArchiefItem extends Match13ArchiefRij {
  data: AppState;
}

export async function haalMatch13Archief(): Promise<Match13ArchiefRij[]> {
  if (!(await isAdmin())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_archief")
    .select("id, club, reden, gearchiveerd_op")
    .order("gearchiveerd_op", { ascending: false });

  if (error) {
    console.error("Kon Match13-archief niet ophalen:", error.message);
    return [];
  }
  return data as Match13ArchiefRij[];
}

export async function haalMatch13ArchiefItem(id: string): Promise<Match13ArchiefItem | null> {
  if (!(await isAdmin())) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_archief")
    .select("id, club, reden, gearchiveerd_op, data")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Kon Match13-archiefitem niet ophalen:", id, error.message);
    return null;
  }
  return data as Match13ArchiefItem;
}
