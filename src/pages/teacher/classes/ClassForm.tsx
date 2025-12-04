import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { classService } from "@/services/classService";
import type { ICreateClassDto } from "@/types/class";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { toastError, toastSuccess } from "@/lib/toast";

export default function ClassForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateClassDto>({
    name: "",
    description: "",
    grade: "E4",
    term: "T1",
    schoolYear: "2024-2025",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      loadClass();
    }
  }, [id, isEdit]);

  const loadClass = async () => {
    try {
      setLoading(true);
      const classData = await classService.getById(id!);
      setFormData({
        name: classData.name,
        description: classData.description || "",
        grade: classData.grade,
        term: classData.term || "T1",
        schoolYear: classData.schoolYear || "2024-2025",
        isActive: classData.isActive,
      });
    } catch (error: any) {
      console.error("Failed to load class:", error);
      toastError(error?.message || "Failed to load class");
      navigate("/teacher/classes");
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Class name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Class name must be less than 100 characters";
    }

    if (!formData.grade) {
      newErrors.grade = "Grade is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      if (isEdit && id) {
        await classService.update(id, formData);
        toastSuccess("Class updated successfully");
      } else {
        await classService.create(formData);
        toastSuccess("Class created successfully");
      }

      navigate("/teacher/classes");
    } catch (error: any) {
      console.error("Failed to save class:", error);
      toastError(error?.message || "Failed to save class");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ICreateClassDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/teacher/classes")}
          className="p-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Edit Class" : "Create New Class"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? "Update class information" : "Fill in the details below"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        {/* Class Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Math 4A"
            error={errors.name}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            placeholder="Brief description of the class..."
          />
        </div>

        {/* Grade and Term Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.grade}
              onChange={(e) => handleChange("grade", e.target.value)}
              className={`w-full h-10 px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.grade ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="E4">Elementary 4</option>
              <option value="E5">Elementary 5</option>
              <option value="E6">Elementary 6</option>
              <option value="M1">Middle 1</option>
              <option value="M2">Middle 2</option>
              <option value="M3">Middle 3</option>
            </select>
            {errors.grade && (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.grade}
              </p>
            )}
          </div>

          {/* Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term
            </label>
            <select
              value={formData.term}
              onChange={(e) => handleChange("term", e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="T1">Term 1</option>
              <option value="T2">Term 2</option>
            </select>
          </div>
        </div>

        {/* School Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Year
          </label>
          <Input
            type="text"
            value={formData.schoolYear}
            onChange={(e) => handleChange("schoolYear", e.target.value)}
            placeholder="e.g., 2024-2025"
          />
        </div>

        {/* Active Status */}
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => handleChange("isActive", e.target.checked)}
          label="Active (students can be assigned to this class)"
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/teacher/classes")}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            className="flex-1"
          >
            {!loading && <Save className="w-5 h-5 mr-2 inline" />}
            {isEdit ? "Update Class" : "Create Class"}
          </Button>
        </div>
      </form>
    </div>
  );
}
