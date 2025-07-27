import { QueryClient } from '@tanstack/react-query';

export const createMockQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

export const queryClientMock = {
  getQueryData: jest.fn(),
  setQueryData: jest.fn(),
  invalidateQueries: jest.fn(),
  refetchQueries: jest.fn(),
  cancelQueries: jest.fn(),
  removeQueries: jest.fn(),
  clear: jest.fn(),
  getQueryCache: jest.fn(),
  getMutationCache: jest.fn(),
  mount: jest.fn(),
  unmount: jest.fn(),
  getLogger: jest.fn(),
  getDefaultOptions: jest.fn(),
  setDefaultOptions: jest.fn(),
  setQueryDefaults: jest.fn(),
  getQueryDefaults: jest.fn(),
  setMutationDefaults: jest.fn(),
  getMutationDefaults: jest.fn(),
  fetchQuery: jest.fn(),
  fetchInfiniteQuery: jest.fn(),
  prefetchQuery: jest.fn(),
  prefetchInfiniteQuery: jest.fn(),
  ensureQueryData: jest.fn(),
  ensureInfiniteQueryData: jest.fn(),
  resumePausedMutations: jest.fn(),
  getQueriesData: jest.fn(),
  setQueriesData: jest.fn(),
  resetQueries: jest.fn(),
  isLoading: jest.fn().mockReturnValue(false),
  isFetching: jest.fn().mockReturnValue(false),
  isMutating: jest.fn().mockReturnValue(false),
}; 