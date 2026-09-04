/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function ApiProvider({ children }: { children: ReactNode }) {
  // Use useState to instantiate QueryClient to avoid re-creation on re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes standard stale duration
            gcTime: 10 * 60 * 1000, // 10 minutes cache duration (formerly cacheTime)
            refetchOnWindowFocus: false, // Prevent distracting refetches on tab click
            retry: (failureCount, error: any) => {
              // Only retry on typical connectivity dropouts; do not retry authorization/client errors
              if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
                return false;
              }
              return failureCount < 2; // Maximum 2 retries
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
