import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Student {
  id: string;
  fullName: string;
  email: string;
  grade?: string;
  school?: string;
}

/**
 * Fetch students for teacher selection
 */
export function useStudents(search?: string, limit: number = 100) {
  return useQuery({
    queryKey: ["students", search, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("role", "STUDENT");
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      const response = await api.get<{
        success: boolean;
        data: {
          data: Student[];
          total: number;
          page: number;
          totalPages: number;
        };
        timestamp: string;
      }>(`/users?${params.toString()}`);
      return response.data.data.data;
    },
  });
}
