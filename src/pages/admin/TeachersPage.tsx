import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUsers,
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

export function TeachersPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [searchParams, setSearchParams] = useState({
    role: "TEACHER",
    page: 1,
    limit: 20,
    search: "",
    isActive: undefined as boolean | undefined,
  });

  // React Query hooks
  const { data, isLoading } = useUsers(searchParams);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleCreate = async (
    formData: CreateUserDto | Partial<CreateUserDto>
  ) => {
    await createMutation.mutateAsync(formData as CreateUserDto);
    setShowForm(false);
  };

  const handleUpdate = async (
    formData: CreateUserDto | Partial<CreateUserDto>
  ) => {
    if (!editingTeacher) return;
    await updateMutation.mutateAsync({
      id: editingTeacher.id,
      data: formData as CreateUserDto,
    });
    setEditingTeacher(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    await deleteMutation.mutateAsync(id);
  };

  const handleViewDetails = (user: User) => {
    navigate(`/admin/teachers/${user.id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingTeacher(null);
          }}
        >
          Add Teacher
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search by name, email, username..."
          value={searchParams.search}
          onChange={(e) =>
            setSearchParams({
              ...searchParams,
              search: e.target.value,
              page: 1,
            })
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
          setEditingTeacher(null);
        }}
        title={editingTeacher ? "Edit Teacher" : "Create Teacher"}
        size="xl"
      >
        <UserForm
          user={editingTeacher || undefined}
          onSubmit={editingTeacher ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingTeacher(null);
          }}
          allowedRoles={[UserRole.TEACHER]}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Teachers Table */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <UserList
            users={data?.data || []}
            onEdit={(user) => {
              setEditingTeacher(user);
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
