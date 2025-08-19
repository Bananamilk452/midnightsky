import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { HomeSidemenuClient } from "@/components/home/HomeSidemenuClient";
import { getQueryClient } from "@/lib/getQueryClient";
import { getSession } from "@/lib/session";

export async function HomeSidemenu() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["session"],
    queryFn: getSession,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeSidemenuClient />
    </HydrationBoundary>
  );
}
