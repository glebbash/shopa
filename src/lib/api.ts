import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Item = {
  id: string;
  created_at: string;
  name: string;
  group: string;
  checked: boolean;
  list_id: string;
};

export const loadUserShoppingLists = api(async (userId: string) => {
  // ugly fix for double rendering
  if (!userId) return { data: undefined, error: null };

  return supabase.from("shopping_list").select().eq("created_by", userId);
});

export const loadShoppingList = api(async (listId: string) =>
  supabase
    .from("shopping_list")
    .select("*, items(*)")
    .eq("id", listId)
    .eq("items.list_id", listId)
    .single()
);

export const createShoppingList = api(
  async (userId: string, listName: string) =>
    supabase.from("shopping_list").insert({
      created_by: userId,
      name: listName,
    })
);

export async function renameShoppingList(listId: string, listName: string) {
  const res = await supabase
    .from("shopping_list")
    .update({
      name: listName,
    })
    .eq("id", listId);

  if (res.error) throw new Error(res.error.message);

  return res.data;
}

export const deleteShoppingList = api(async (listId: string) => {
  await api(
    async () => await supabase.from("items").delete().eq("list_id", listId)
  )();

  return supabase.from("shopping_list").delete().eq("id", listId);
});

export const createShoppingItem = api(
  async (listId: string, itemName: string, groupName: string) =>
    supabase.from("items").insert({
      list_id: listId,
      name: itemName,
      group: groupName,
    })
);

export const updateItem = api(async (item: Item) =>
  supabase.from("items").update(item).eq("id", item.id)
);

export const deleteItem = api(async (itemId: string) =>
  supabase.from("items").delete().eq("id", itemId)
);

// utils

function api<A extends unknown[], R>(
  fn: (...args: A) => Promise<{ data: R; error: PostgrestError | null }>
) {
  return async (...args: A) => {
    const res = await fn(...args);
    if (res.error) throw new Error(res.error.message);

    return res.data;
  };
}
