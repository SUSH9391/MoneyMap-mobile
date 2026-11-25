import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateTransactionRequest,
  transactionApi,
  TransactionFilters,
} from '../api/endpoints/transactions';

export const useTransactions = (filters: TransactionFilters = {}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionApi.getTransactions(filters),
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionApi.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};