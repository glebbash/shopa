import { useEffect } from "react";
import useSWR from "swr";

import { loadShoppingList, Item } from "../lib/api";
import { supabase } from "../lib/supabase";

export function useShoppingList(listId: string) {
  const { data, error, mutate } = useSWR(`lists/${listId}`, () =>
    loadShoppingList(listId)
  );

  if (error) throw error;

  useEffect(() => {
    const channel = supabase
      .channel("public:items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        (e) => {
          if ((e.new as Item).list_id === listId) {
            mutate();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  });

  return data;
}
