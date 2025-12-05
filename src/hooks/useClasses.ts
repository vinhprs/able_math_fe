import { useQuery } from '@tanstack/react-query';
import { classService } from '@/services/classService';
import type { IClassQueryParams } from '@/types/class';

export function useClasses(params?: IClassQueryParams) {
  return useQuery({
    queryKey: ['classes', params],
    queryFn: () => classService.getAll(params),
  });
}

