import { supabase } from "../supabase";

export function LogoutButton() {
  return <button onClick={() => supabase.auth.signOut()}>Log out</button>;
}
