import { Loader } from "@aws-amplify/ui-react";
import BotExplorePage from "./BotExplorePage";
import { useAuth } from "../hooks/useAuth";
import NotFound from "./NotFound";

export const HomePage = () => {
  const { isLoading, isAdmin } = useAuth();

  if (isLoading) return <Loader />;
  if (isAdmin) return <BotExplorePage />;

  return <NotFound />;
}