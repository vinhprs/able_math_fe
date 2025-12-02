import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

/**
 * Admin dashboard statistics
 */
export interface IAdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalTests: number;
  activeSubmissions: number;
  testsByGrade: { grade: string; count: number }[];
  submissionsThisWeek: { date: string; count: number }[];
}

/**
 * Recent activity for admin
 */
export interface IRecentActivity {
  tests: Array<{
    id: string;
    testCode: string;
    title: string;
    createdAt: string;
  }>;
  students: Array<{
    id: string;
    username: string;
    fullName: string;
    createdAt: string;
  }>;
  submissions: Array<{
    id: string;
    testCode: string;
    studentName: string;
    submittedAt: string;
  }>;
}

/**
 * Teacher dashboard statistics
 */
export interface ITeacherStats {
  totalClasses: number;
  pendingGrading: number;
  thisWeekTests: number;
  totalStudents: number;
}

/**
 * Student dashboard statistics
 */
export interface IStudentStats {
  pendingTests: number;
  completedTests: number;
  averageScore: number;
  latestScore: number;
  latestResultId: string | null;
  scoreTrend: { date: string; score: number }[];
}

/**
 * Fetch admin dashboard statistics
 */
export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: IAdminStats;
        timestamp: string;
      }>("/admin/dashboard/stats");
      return response.data.data;
    },
  });
}

/**
 * Fetch admin recent activity
 */
export function useRecentActivity() {
  return useQuery({
    queryKey: ["admin", "recent-activity"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: IRecentActivity;
        timestamp: string;
      }>("/admin/dashboard/recent-activity");
      return response.data.data;
    },
  });
}

/**
 * Fetch teacher dashboard statistics
 */
export function useTeacherStats() {
  return useQuery({
    queryKey: ["teacher", "stats"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: ITeacherStats;
        timestamp: string;
      }>("/teacher/dashboard/stats");
      return response.data.data;
    },
  });
}

/**
 * Fetch teacher classes
 */
export function useMyClasses() {
  return useQuery({
    queryKey: ["teacher", "classes"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: Array<{
          id: string;
          name: string;
          studentCount: number;
          recentActivity: string;
        }>;
        timestamp: string;
      }>("/teacher/classes");
      return response.data.data;
    },
  });
}

/**
 * Fetch upcoming deadlines for teacher
 */
export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: ["teacher", "deadlines"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: Array<{
          id: string;
          testCode: string;
          title: string;
          dueDate: string;
          pendingGrading: number;
        }>;
        timestamp: string;
      }>("/teacher/dashboard/deadlines");
      return response.data.data;
    },
  });
}

/**
 * Fetch student dashboard statistics
 */
export function useStudentStats() {
  return useQuery({
    queryKey: ["student", "stats"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: IStudentStats;
        timestamp: string;
      }>("/student/dashboard/stats");
      return response.data.data;
    },
  });
}

/**
 * Fetch student's assigned tests
 */
export function useMyTests() {
  return useQuery({
    queryKey: ["student", "tests"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: Array<{
          id: string;
          testId: string;
          testCode: string;
          title: string;
          status: string;
          dueDate: string | null;
          submittedAt: string | null;
          score: number | null;
        }>;
        timestamp: string;
      }>("/student/tests");
      return response.data.data;
    },
  });
}

