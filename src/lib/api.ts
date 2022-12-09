import { supabase } from "./supabase";

export async function loadUserShoppingLists(userId: string | undefined) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("shopping_list")
    .select()
    .eq("created_by", userId);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
}

export async function loadShoppingList(listId: string) {
  const { data, error } = await supabase
    .from("shopping_list")
    .select("*, items(*)")
    .eq("id", listId)
    .eq("items.list_id", listId)
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function createShoppingList(userId: string, listName: string) {
  const { data, error } = await supabase.from("shopping_list").insert({
    created_by: userId,
    name: listName,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
}

export async function createShoppingItem(
  listId: string,
  itemName: string,
  groupName: string
) {
  const { data, error } = await supabase.from("items").insert({
    list_id: listId,
    name: itemName,
    group: groupName,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
}

export async function setItemChecked(itemId: string, checked: boolean) {
  const { data, error } = await supabase
    .from("items")
    .update({ checked })
    .eq("id", itemId);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
}
