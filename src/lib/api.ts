import { supabase } from "./supabase";

export async function loadUserShoppingLists(userId: string) {
  if (!userId) return undefined; // ugly fix for double rendering

  const { data, error } = await supabase
    .from("shopping_list")
    .select()
    .eq("created_by", userId);

  if (error) throw new Error(error.message);

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

  if (error) throw new Error(error.message);

  return data;
}

export async function renameShoppingList(listId: string, listName: string) {
  const { data, error } = await supabase
    .from("shopping_list")
    .update({
      name: listName,
    })
    .eq("id", listId);

  if (error) throw new Error(error.message);

  return data;
}

export async function deleteShoppingList(listId: string) {
  const res2 = await supabase.from("items").delete().eq("list_id", listId);
  if (res2.error) throw new Error(res2.error.message);

  const res = await supabase.from("shopping_list").delete().eq("id", listId);
  if (res.error) throw new Error(res.error.message);

  return true;
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
