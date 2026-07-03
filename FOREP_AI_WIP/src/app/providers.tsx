"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 0;
              const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
              if ([400, 401, 403, 404, 429].includes(status) || code === "AI_RATE_LIMITED") return false;
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}




