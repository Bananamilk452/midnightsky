import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { HomeSidemenuClient } from "@/components/home/HomeSidemenuClient";
import { getSession } from "@/lib/session";

export async function HomeSidemenu() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["session"],
    queryFn: getSession,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeSidemenuClient />
    </HydrationBoundary>
  );
}
