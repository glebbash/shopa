import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { supabase } from "../lib/supabase";

export function LoginPage() {
  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Avatar src="/shopa.png" sx={{ width: 72, height: 72 }} />
      <Typography>Shopa</Typography>
      <LoginButton />
    </Box>
  );
}

function LoginButton() {
  const handleLogin = async () => {
    await supabase.signIn();
  };

  return <Button onClick={handleLogin}>Log in</Button>;
}
