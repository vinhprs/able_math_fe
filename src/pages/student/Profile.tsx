import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  School,
  Users,
  Phone,
  Edit2,
  Save,
  X,
  Key,
  FileText,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { toastSuccess, toastError } from "@/lib/toast";
import api from "@/lib/api";

// Validation schemas
const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  school: z.string().optional(),
  parentName: z
    .string()
    .min(2, "Parent name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  parentContact: z
    .string()
    .regex(/^[0-9+\-() ]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

interface StudentProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  school: string | null;
  grade: string;
  parentName: string | null;
  parentContact: string | null;
  createdAt: string;
}

interface TestHistory {
  totalTests: number;
  completedTests: number;
  pendingTests: number;
  avgScore: number;
  recentTests: Array<{
    testTitle: string;
    testCode: string;
    score: number;
    gradedAt: string;
  }>;
}

// Profile Field Component
interface ProfileFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  readOnly?: boolean;
}

function ProfileField({
  icon: Icon,
  label,
  value,
  readOnly = false,
}: ProfileFieldProps) {
  return (
    <div className="flex items-center gap-4 p-3 bg-secondary-50 rounded-lg">
      <Icon className="w-5 h-5 text-secondary-400" />
      <div className="flex-1">
        <p className="text-sm text-secondary-500">{label}</p>
        <p className="font-medium text-secondary-900">{value}</p>
      </div>
      {readOnly && (
        <Badge variant="default" className="text-xs">
          Read-only
        </Badge>
      )}
    </div>
  );
}

// Stat Item Component
interface StatItemProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: "gray" | "green" | "yellow" | "blue";
}

function StatItem({ label, value, icon: Icon, color = "gray" }: StatItemProps) {
  const colorClasses = {
    gray: "text-secondary-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    blue: "text-blue-600",
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
        <span className="text-sm text-secondary-600">{label}</span>
      </div>
      <span className={`font-bold ${colorClasses[color]}`}>{value}</span>
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-secondary-200 rounded w-64 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-secondary-200 rounded animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-secondary-200 rounded animate-pulse" />
          <div className="h-48 bg-secondary-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Change Password Modal
interface ChangePasswordModalProps {
  onClose: () => void;
}

function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const response = await api.put<{
        success: boolean;
        data: { message: string };
        timestamp: string;
      }>("/student/profile/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      toastSuccess("Password changed successfully");
      reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to change password";
      toastError(errorMessage);
    },
  });

  const onSubmit = (data: PasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <Modal isOpen onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-xl font-bold text-secondary-900">
          Change Password
        </h2>

        <div>
          <Input
            type="password"
            label="Current Password"
            {...register("currentPassword")}
            error={errors.currentPassword?.message}
          />
        </div>

        <div>
          <Input
            type="password"
            label="New Password"
            {...register("newPassword")}
            error={errors.newPassword?.message}
          />
        </div>

        <div>
          <Input
            type="password"
            label="Confirm New Password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="flex-1"
          >
            {changePasswordMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Main Profile Component
export function StudentProfile() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Fetch profile
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: StudentProfile;
        timestamp: string;
      }>("/student/profile");
      return response.data.data;
    },
  });

  // Fetch test history
  const { data: testHistoryResponse } = useQuery({
    queryKey: ["student-test-history"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: TestHistory;
        timestamp: string;
      }>("/student/profile/test-history");
      return response.data.data;
    },
  });

  const profile = profileResponse;
  const testHistory = testHistoryResponse;

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await api.put<{
        success: boolean;
        data: StudentProfile;
        timestamp: string;
      }>("/student/profile", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      setIsEditing(false);
      toastSuccess("Profile updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      toastError(errorMessage);
    },
  });

  // Form for profile edit
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          fullName: profile.fullName,
          school: profile.school || "",
          parentName: profile.parentName || "",
          parentContact: profile.parentContact || "",
        }
      : undefined,
  });

  const onSubmit = (data: ProfileForm) => {
    // Clean up empty strings
    const cleanData: Partial<ProfileForm> = {};
    if (data.fullName) cleanData.fullName = data.fullName;
    if (data.school) cleanData.school = data.school;
    if (data.parentName) cleanData.parentName = data.parentName;
    if (data.parentContact) cleanData.parentContact = data.parentContact;

    updateProfileMutation.mutate(cleanData as ProfileForm);
  };

  const handleCancelEdit = () => {
    reset();
    setIsEditing(false);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-secondary-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">My Profile</h1>
        <p className="text-secondary-500">
          View and manage your account information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary-900">
                Personal Information
              </h2>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username (Read-only) */}
              <ProfileField
                icon={User}
                label="Username"
                value={profile.username}
                readOnly
              />

              {/* Email (Read-only) */}
              <ProfileField
                icon={Mail}
                label="Email"
                value={profile.email}
                readOnly
              />

              {/* Grade (Read-only) */}
              <ProfileField
                icon={School}
                label="Grade"
                value={profile.grade}
                readOnly
              />

              {/* Full Name (Editable) */}
              {isEditing ? (
                <div>
                  <Input
                    label="Full Name"
                    {...register("fullName")}
                    error={errors.fullName?.message}
                  />
                </div>
              ) : (
                <ProfileField
                  icon={User}
                  label="Full Name"
                  value={profile.fullName}
                />
              )}

              {/* School (Editable) */}
              {isEditing ? (
                <div>
                  <Input label="School" {...register("school")} />
                </div>
              ) : (
                <ProfileField
                  icon={School}
                  label="School"
                  value={profile.school || "Not set"}
                />
              )}

              {/* Parent Name (Editable) */}
              {isEditing ? (
                <div>
                  <Input
                    label="Parent Name"
                    {...register("parentName")}
                    error={errors.parentName?.message}
                  />
                </div>
              ) : (
                <ProfileField
                  icon={Users}
                  label="Parent Name"
                  value={profile.parentName || "Not set"}
                />
              )}

              {/* Parent Contact (Editable) */}
              {isEditing ? (
                <div>
                  <Input
                    label="Parent Contact"
                    {...register("parentContact")}
                    error={errors.parentContact?.message}
                  />
                </div>
              ) : (
                <ProfileField
                  icon={Phone}
                  label="Parent Contact"
                  value={profile.parentContact || "Not set"}
                />
              )}

              {/* Edit Mode Actions */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </form>

            {/* Change Password Button */}
            {!isEditing && (
              <div className="pt-6 border-t border-secondary-200 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Test History Card */}
        <div className="space-y-6">
          {testHistory && (
            <>
              {/* Stats */}
              <Card className="p-6">
                <h3 className="font-bold mb-4 text-secondary-900">
                  Test Statistics
                </h3>
                <div className="space-y-4">
                  <StatItem
                    label="Total Tests"
                    value={testHistory.totalTests}
                    icon={FileText}
                  />
                  <StatItem
                    label="Completed"
                    value={testHistory.completedTests}
                    icon={FileText}
                    color="green"
                  />
                  <StatItem
                    label="Pending"
                    value={testHistory.pendingTests}
                    icon={FileText}
                    color="yellow"
                  />
                  <StatItem
                    label="Average Score"
                    value={`${testHistory.avgScore}%`}
                    icon={TrendingUp}
                    color="blue"
                  />
                </div>
              </Card>

              {/* Recent Tests */}
              {testHistory.recentTests &&
                testHistory.recentTests.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-bold mb-4 text-secondary-900">
                      Recent Tests
                    </h3>
                    <div className="space-y-3">
                      {testHistory.recentTests.map((test, index) => (
                        <div
                          key={index}
                          className="p-3 bg-secondary-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-secondary-900">
                              {test.testTitle}
                            </span>
                            <Badge
                              variant={
                                test.score >= 80
                                  ? "success"
                                  : test.score >= 60
                                  ? "warning"
                                  : "danger"
                              }
                            >
                              {test.score}%
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-secondary-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(test.gradedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
            </>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
