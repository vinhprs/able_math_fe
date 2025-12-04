import api from '@/lib/api';
import type {
  IAssignment,
  IAssignToClassDto,
  IAssignToStudentsDto,
  IAssignmentQueryParams,
  IStudentAssignmentQueryParams,
  IPaginatedAssignmentsResponse,
  IAssignToClassResponse,
  IStudentAssignmentDetail,
  IUpcomingDeadline,
  IStudentAssignmentStats,
} from '@/types/assignment';

/**
 * Assignment service for API calls
 * All methods use the configured axios instance with auth interceptors
 */
export const assignmentService = {
  /**
   * Get teacher's assignments with filters
   * GET /api/assignments/teacher
   */
  async getTeacherAssignments(
    params?: IAssignmentQueryParams,
  ): Promise<IPaginatedAssignmentsResponse> {
    const response = await api.get<{
      success: boolean;
      data: IPaginatedAssignmentsResponse;
      timestamp: string;
    }>('/assignments/teacher', { params });
    return response.data.data;
  },

  /**
   * Get assignment by ID
   * GET /api/assignments/:id
   */
  async getById(id: string): Promise<IAssignment> {
    const response = await api.get<{
      success: boolean;
      data: IAssignment;
      timestamp: string;
    }>(`/assignments/${id}`);
    return response.data.data;
  },

  /**
   * Assign test to entire class
   * POST /api/assignments/assign-to-class
   */
  async assignToClass(data: IAssignToClassDto): Promise<IAssignToClassResponse> {
    const response = await api.post<{
      success: boolean;
      data: IAssignToClassResponse;
      timestamp: string;
    }>('/assignments/assign-to-class', data);
    return response.data.data;
  },

  /**
   * Assign test to specific students (bulk assign)
   * POST /api/assignments/bulk
   */
  async assignToStudents(data: IAssignToStudentsDto): Promise<{
    assigned: number;
    skipped: number;
    assignments: Array<{
      id: string;
      studentName?: string;
    }>;
  }> {
    const response = await api.post<{
      success: boolean;
      data: {
        assigned: number;
        skipped: number;
        assignments: Array<{
          id: string;
          studentName?: string;
        }>;
      };
      timestamp: string;
    }>('/assignments/bulk', data);
    return response.data.data;
  },

  /**
   * Get students who received a specific test
   * GET /api/assignments/test/:testId/students
   */
  async getAssignedStudents(testId: string): Promise<
    Array<{
      assignmentId: string;
      student: {
        id: string;
        fullName: string;
        grade?: string;
      };
      status: string;
      assignedAt: string;
      deadline: string | null;
    }>
  > {
    const response = await api.get<{
      success: boolean;
      data: Array<{
        assignmentId: string;
        student: {
          id: string;
          fullName: string;
          grade?: string;
        };
        status: string;
        assignedAt: string;
        deadline: string | null;
      }>;
      timestamp: string;
    }>(`/assignments/test/${testId}/students`);
    return response.data.data;
  },

  /**
   * Delete assignment
   * DELETE /api/assignments/:id
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/assignments/${id}`);
  },

  /**
   * Extend deadline for assignment
   * POST /api/assignments/:id/extend-deadline
   */
  async extendDeadline(
    id: string,
    newDeadline: string,
  ): Promise<{
    message: string;
    newDeadline: string;
  }> {
    const response = await api.post<{
      success: boolean;
      data: {
        message: string;
        newDeadline: string;
      };
      timestamp: string;
    }>(`/assignments/${id}/extend-deadline`, {
      newDeadline,
    });
    return response.data.data;
  },

  // ========== Student Endpoints ==========

  /**
   * Get all assignments for current student
   * GET /api/student/assignments
   */
  async getMyAssignments(
    params?: IStudentAssignmentQueryParams,
  ): Promise<IPaginatedAssignmentsResponse> {
    const response = await api.get<{
      success: boolean;
      data: IPaginatedAssignmentsResponse;
      timestamp: string;
    }>('/student/assignments', { params });
    return response.data.data;
  },

  /**
   * Get assignment detail for student
   * GET /api/student/assignments/:id
   */
  async getMyAssignmentDetail(id: string): Promise<IStudentAssignmentDetail> {
    const response = await api.get<{
      success: boolean;
      data: IStudentAssignmentDetail;
      timestamp: string;
    }>(`/student/assignments/${id}`);
    return response.data.data;
  },

  /**
   * Get upcoming deadlines (next 7 days)
   * GET /api/student/assignments/deadlines/upcoming
   */
  async getUpcomingDeadlines(): Promise<IUpcomingDeadline[]> {
    const response = await api.get<{
      success: boolean;
      data: IUpcomingDeadline[];
      timestamp: string;
    }>('/student/assignments/deadlines/upcoming');
    return response.data.data;
  },

  /**
   * Get assignment statistics summary
   * GET /api/student/assignments/stats/summary
   */
  async getMyAssignmentStats(): Promise<IStudentAssignmentStats> {
    const response = await api.get<{
      success: boolean;
      data: IStudentAssignmentStats;
      timestamp: string;
    }>('/student/assignments/stats/summary');
    return response.data.data;
  },
};

