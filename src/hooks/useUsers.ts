import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  PaginatedResponse,
} from "@/types/user.types";
import { toastSuccess, toastError } from "@/lib/toast";

/**
 * Get all users with filters (Admin/Teacher based on role)
 */
export function useUsers(params?: QueryUserDto) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.role) queryParams.append("role", params.role);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.school) queryParams.append("school", params.school);
      if (params?.grade) queryParams.append("grade", params.grade);
      if (params?.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params?.createdBy) queryParams.append("createdBy", params.createdBy);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const response = await api.get<PaginatedResponse<User>>(
        `/users?${queryParams.toString()}`
      );
      return response.data.data;
    },
  });
}

/**
 * Get current user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: User }>(
        "/users/me"
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get teacher's students only
 */
export function useMyStudents(
  params?: Omit<QueryUserDto, "role" | "createdBy">
) {
  return useQuery({
    queryKey: ["my-students", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.school) queryParams.append("school", params.school);
      if (params?.grade) queryParams.append("grade", params.grade);
      if (params?.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const response = await api.get<PaginatedResponse<User>>(
        `/users/my-students?${queryParams.toString()}`
      );
      return response.data.data;
    },
  });
}

/**
 * Get user by ID
 * Returns the response wrapper so component can access .data property
 */
export function useUser(
  id: string | null | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/users/${id}`);
      // Response structure from backend: { success: true, data: User, timestamp?: string }
      // Axios response structure: response.data = { success: true, data: User, timestamp?: string }
      // Return the wrapper object so component can access .data property
      return response.data.data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserDto) => {
      const response = await api.post<{ success: boolean; data: User }>(
        "/users",
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["my-students"] });
      toastSuccess("User created successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to create user";
      toastError(message);
    },
  });
}

/**
 * Update user mutation
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDto }) => {
      const response = await api.patch<{ success: boolean; data: User }>(
        `/users/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["my-students"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      toastSuccess("User updated successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update user";
      toastError(message);
    },
  });
}

/**
 * Delete user mutation
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["my-students"] });
      toastSuccess("User deleted successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to delete user";
      toastError(message);
    },
  });
}

/**
 * Get students for selection (without pagination for dropdowns)
 */
export function useStudents(search?: string, limit: number = 100) {
  return useQuery({
    queryKey: ["students", search, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("role", "STUDENT");
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      const response = await api.get<PaginatedResponse<User>>(
        `/users?${params.toString()}`
      );
      return response.data.data;
    },
  });
}

/**
 * Get teachers for selection (Admin only)
 */
export function useTeachers(search?: string, limit: number = 100) {
  return useQuery({
    queryKey: ["teachers", search, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("role", "TEACHER");
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      const response = await api.get<PaginatedResponse<User>>(
        `/users?${params.toString()}`
      );
      return response.data.data;
    },
  });
}
