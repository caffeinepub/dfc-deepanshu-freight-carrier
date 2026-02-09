import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// Query to check if admin has been bootstrapped
export function useIsAdminBootstrapped() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdminBootstrapped'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdminBootstrapped();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// Mutation to bootstrap first admin
export function useBootstrapFirstAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.bootstrapFirstAdmin();
    },
    onSuccess: () => {
      // Invalidate admin-related queries to trigger UI refresh
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['isAdminBootstrapped'] });
    },
  });
}
