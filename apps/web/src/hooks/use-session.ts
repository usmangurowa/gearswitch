"use client";

import { authClient } from "@/auth/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Custom useSession hook that wraps Better Auth's session with TanStack Query.
 * This provides:
 * - Shared cache across all components (no duplicate requests)
 * - Stale-while-revalidate (shows cached data while refetching)
 * - No flicker on navigation (cache persists across pages)
 *
 * @example
 * ```tsx
 * const { data: session, isPending } = useSession();
 * if (isPending) return <Skeleton />;
 * if (!session) return <LoginButton />;
 * return <div>Hello {session.user.name}</div>;
 * ```
 */
export const useSession = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data;
    },
  });

  /**
   * Invalidate and refetch the session.
   * Call this after login/logout to update the session immediately.
   */
  const refetch = () => {
    return queryClient.invalidateQueries({ queryKey: ["session"] });
  };

  return {
    data: query.data ?? null,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch,
  };
};
