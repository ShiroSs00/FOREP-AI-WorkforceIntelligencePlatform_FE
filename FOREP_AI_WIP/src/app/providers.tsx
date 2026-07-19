"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import { useAuthStore } from "@/auth/auth-store";
import { removeProtectedQueries } from "@/lib/query-keys";
import { shouldRetryQuery } from "@/lib/query-policy";

export function Providers({ children }: { children: React.ReactNode }) {
  const identity = useAuthStore((state) => state.user ? `${state.user.id}:${state.user.workspaceId ?? "platform"}` : state.token ? "session-pending" : null);
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: shouldRetryQuery,

            refetchOnWindowFocus: false,
          },
          mutations: { retry: false },
        },
      }),
  );
  const previousIdentity = useRef(identity);

  useEffect(() => {
    if (previousIdentity.current && previousIdentity.current !== identity) removeProtectedQueries(client);
    previousIdentity.current = identity;
  }, [client, identity]);

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}