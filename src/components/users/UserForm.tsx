import { useState, useEffect } from "react";
import type { User, CreateUserDto } from "@/types/user.types";
import { UserRole } from "@/shared/types/enum";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserDto | Partial<CreateUserDto>) => Promise<void>;
  onCancel: () => void;
  allowedRoles: UserRole[];
  isSubmitting?: boolean;
}

export function UserForm({
  user,
  onSubmit,
  onCancel,
  allowedRoles,
  isSubmitting = false,
}: UserFormProps) {
  const [formData, setFormData] = useState<
    CreateUserDto & { password?: string }
  >({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    fullName: user?.fullName || "",
    role: user?.role || allowedRoles[0] || UserRole.STUDENT,
    school: user?.school || "",
    grade: user?.grade || "",
    parentName: user?.parentName || "",
    parentContact: user?.parentContact || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
        fullName: user.fullName,
        role: user.role,
        school: user.school || "",
        grade: user.grade || "",
        parentName: user.parentName || "",
        parentContact: user.parentContact || "",
      });
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!user && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData = user
      ? {
          ...formData,
          ...(formData.password ? { password: formData.password } : {}),
        }
      : formData;

    // Remove password if empty when editing
    if (user && !formData.password) {
      const { password, ...dataWithoutPassword } = submitData;
      await onSubmit(dataWithoutPassword);
    } else {
      await onSubmit(submitData);
    }
  };

  const roleOptions = allowedRoles.map((role) => ({
    value: role,
    label: role,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          error={errors.username}
          required
          disabled={!!user}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />

        <Input
          label="Full Name"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          error={errors.fullName}
          required
        />

        <Input
          label={user ? "Password (leave blank to keep current)" : "Password"}
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          error={errors.password}
          required={!user}
        />

        <Select
          label="Role"
          value={formData.role}
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value as UserRole })
          }
          options={roleOptions}
          required
        />

        <Input
          label="School"
          value={formData.school}
          onChange={(e) => setFormData({ ...formData, school: e.target.value })}
        />

        <Input
          label="Grade"
          value={formData.grade}
          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
        />

        {formData.role === UserRole.STUDENT && (
          <>
            <Input
              label="Parent Name"
              value={formData.parentName}
              onChange={(e) =>
                setFormData({ ...formData, parentName: e.target.value })
              }
            />

            <Input
              label="Parent Contact"
              value={formData.parentContact}
              onChange={(e) =>
                setFormData({ ...formData, parentContact: e.target.value })
              }
            />
          </>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {user ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
