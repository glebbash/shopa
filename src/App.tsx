import { useSession } from "./hooks/useSession";
import { LoginPage } from "./pages/LoginPage";
import { MainPage } from "./pages/MainPage";

export default function App() {
  const session = useSession();

  if (!session) return <LoginPage />;

  return <MainPage />;
}
