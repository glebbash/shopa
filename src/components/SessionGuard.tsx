import { useSession } from "../hooks/useSession";

// @ts-ignore
export function SessionGuard({ value, fallback }) {
  const session = useSession();

  if (session) return value(session);

  return fallback();
}
