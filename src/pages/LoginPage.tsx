import { useState } from "react";
import { useSession } from "../hooks/useSession";
import { supabase } from "../supabase";

export function LoginPage() {
  return (
    <div>
      <h1>Shopa</h1>
      <h2>You need to login</h2>
      <div>
        <LoginButton />
      </div>
    </div>
  );
}

function LoginButton() {
  const session = useSession();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await supabase.signIn();
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <button disabled>Loading...</button>;
  }

  if (!session) {
    return <button onClick={handleLogin}>Log in</button>;
  }

  return <button disabled>Logged in</button>;
}
