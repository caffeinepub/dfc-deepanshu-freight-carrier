import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// Type assertion helper
type ExtendedActor = any;

export function useIsAdminBootstrapped() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdminBootstrapped'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as ExtendedActor).isAdminBootstrapped();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBootstrapFirstAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as ExtendedActor).bootstrapFirstAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdminBootstrapped'] });
    },
  });
}
