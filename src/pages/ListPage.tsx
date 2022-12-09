import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import { useLoaderData } from "react-router-dom";
import useSWR from "swr";

import { supabase } from "../supabase";

export function SpecificListPage() {
  const listId = useLoaderData() as string;

  const { data, error } = useSWR("/lists/" + listId, () => loadList(listId));

  if (error) {
    return <div>Error: {JSON.stringify(error)}</div>;
  }

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ m: 2 }}>
        <Link underline="hover" color="inherit" href="/">
          Lists
        </Link>
        <Typography color="text.primary">
          {data?.name ?? "loading..."}
        </Typography>
      </Breadcrumbs>
      Hopefully content here
    </>
  );
}

async function loadList(listId: string) {
  const { data, error } = await supabase
    .from("shopping_list")
    .select()
    .eq("id", listId)
    .single();

  if (error) throw new Error(error.message);

  return data;
}
