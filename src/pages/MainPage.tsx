import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import useSWR from "swr";

import { useSession } from "../hooks/useSession";
import { supabase } from "../supabase";

export function MyListsPage() {
  const session = useSession()!;
  const userId = session?.user?.id;

  const { data, error } = useSWR(userId + "/lists", () => loadMyLists(userId));

  if (error) {
    return <div>Error: {JSON.stringify(error)}</div>;
  }

  if (data === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ m: 2 }}>
        <Link underline="hover" color="inherit" href="/">
          Lists
        </Link>
      </Breadcrumbs>
      <List>
        {data?.map((l) => (
          <ListItem key={l.id} disablePadding>
            <ListItemButton href={`/lists/${l.id}`}>
              <ListItemIcon>
                <FactCheckIcon />
              </ListItemIcon>
              <ListItemText primary={l.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

async function loadMyLists(userId: string | undefined) {
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
