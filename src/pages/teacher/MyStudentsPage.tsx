import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMyStudents,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/useUsers";
import { UserList } from "@/components/users/UserList";
import { UserForm } from "@/components/users/UserForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { User, CreateUserDto } from "@/types/user.types";
import { UserRole } from "@/shared/types/enum";

export function MyStudentsPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 20,
    search: "",
    school: "",
    grade: "",
    isActive: undefined as boolean | undefined,
  });

  // React Query hooks
  const { data, isLoading } = useMyStudents(searchParams);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleCreate = async (
    formData: CreateUserDto | Partial<CreateUserDto>
  ) => {
    await createMutation.mutateAsync({
      ...formData,
      role: UserRole.STUDENT,
    } as CreateUserDto);
    setShowForm(false);
  };

  const handleUpdate = async (
    formData: CreateUserDto | Partial<CreateUserDto>
  ) => {
    if (!editingStudent) return;
    await updateMutation.mutateAsync({
      id: editingStudent.id,
      data: { ...formData, role: UserRole.STUDENT } as CreateUserDto,
    });
    setEditingStudent(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    await deleteMutation.mutateAsync(id);
  };

  const handleViewDetails = (user: User) => {
    navigate(`/teacher/students/${user.id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600 mt-1">
            {data?.meta.total || 0} students total
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingStudent(null);
          }}
        >
          Add Student
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search by name, email..."
          value={searchParams.search}
          onChange={(e) =>
            setSearchParams({
              ...searchParams,
              search: e.target.value,
              page: 1,
            })
          }
        />
        <Input
          placeholder="Filter by school..."
          value={searchParams.school}
          onChange={(e) =>
            setSearchParams({
              ...searchParams,
              school: e.target.value,
              page: 1,
            })
          }
        />
        <Input
          placeholder="Filter by grade..."
          value={searchParams.grade}
          onChange={(e) =>
            setSearchParams({ ...searchParams, grade: e.target.value, page: 1 })
          }
        />
        <Select
          value={searchParams.isActive?.toString() || ""}
          onChange={(e) =>
            setSearchParams({
              ...searchParams,
              isActive:
                e.target.value === "" ? undefined : e.target.value === "true",
              page: 1,
            })
          }
          options={[
            { value: "", label: "All Status" },
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ]}
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingStudent(null);
        }}
        title={editingStudent ? "Edit Student" : "Create Student"}
        size="xl"
      >
        <UserForm
          user={editingStudent || undefined}
          onSubmit={editingStudent ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
          allowedRoles={[UserRole.STUDENT]}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Students Table */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No students found. Create your first student!
          </p>
        </div>
      ) : (
        <>
          <UserList
            users={data?.data || []}
            onEdit={(user) => {
              setEditingStudent(user);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
            isDeleting={deleteMutation.isPending}
          />

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSearchParams({
                    ...searchParams,
                    page: searchParams.page - 1,
                  })
                }
                disabled={searchParams.page === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 flex items-center">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSearchParams({
                    ...searchParams,
                    page: searchParams.page + 1,
                  })
                }
                disabled={searchParams.page === data.meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
