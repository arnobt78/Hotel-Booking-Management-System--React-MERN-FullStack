import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from "react-query";
import useAppContext from "./useAppContext";

// Custom hook for queries with global loading
export const useQueryWithLoading = <TData, TError = Error>(
  queryKey: any,
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError> & { loadingMessage?: string }
) => {
  const { hideGlobalLoading } = useAppContext();
  
  return useQuery(queryKey, queryFn, {
    ...options,
    onSuccess: (data) => {
      hideGlobalLoading();
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      hideGlobalLoading();
      options?.onError?.(error);
    },
    onSettled: (data, error) => {
      hideGlobalLoading();
      options?.onSettled?.(data, error);
    },
  });
};

// Custom hook for mutations with global loading
export const useMutationWithLoading = <TData, TError, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables> & { loadingMessage?: string }
) => {
  const { showGlobalLoading, hideGlobalLoading } = useAppContext();
  
  return useMutation(mutationFn, {
    ...options,
    onMutate: (variables) => {
      if (options?.loadingMessage) {
        showGlobalLoading(options.loadingMessage);
      } else {
        showGlobalLoading();
      }
      return options?.onMutate?.(variables);
    },
    onSuccess: (data, variables, context) => {
      hideGlobalLoading();
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      hideGlobalLoading();
      options?.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      hideGlobalLoading();
      options?.onSettled?.(data, error, variables, context);
    },
  });
};
