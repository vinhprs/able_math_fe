import { Button, Spinner } from "@/components/ui";
import { toastError, toastSuccess } from "@/lib/toast";
import { achievementTestsApi } from "@/shared/api/achievement-tests.api";
import type { CurriculumUnit } from "@/shared/types/achievement-test.types";
import { useEffect, useState } from "react";
import type { TestSetupData as LocalTestSetupData } from "./types";

interface Props {
  onNext: (data: Partial<LocalTestSetupData>) => void;
  onBack: () => void;
  initialData?: Partial<LocalTestSetupData>;
}

export function Step2_UnitSelection({ onNext, onBack, initialData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(
    initialData?.selectedUnits?.map((u) => u.id) || []
  );
  const [isFetchingUnits, setIsFetchingUnits] = useState(false);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!initialData?.grade || !initialData?.semester) return;

      setIsFetchingUnits(true);
      try {
        const result = await achievementTestsApi.getUnits({
          grade: initialData.grade as string,
          semester: initialData.semester?.toString() || "1",
        });
        setUnits(result.units || []);
      } catch (error: any) {
        toastError(error.response?.data?.message || "Failed to fetch units");
      } finally {
        setIsFetchingUnits(false);
      }
    };

    fetchUnits();
  }, [initialData?.grade, initialData?.semester]);

  const handleToggleUnit = (unitId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleSubmit = async () => {
    if (selectedUnitIds.length === 0) {
      toastError("Please select at least one unit");
      return;
    }

    if (!initialData?.testId) {
      toastError("Test ID is missing");
      return;
    }

    setIsLoading(true);
    try {
      await achievementTestsApi.saveUnits(initialData.testId, {
        selectedUnitIds,
      });

      const selectedUnits = units.filter((u) => selectedUnitIds.includes(u.id));
      toastSuccess("Units selected successfully");
      onNext({ selectedUnits });
    } catch (error: any) {
      toastError(error.response?.data?.message || "Failed to save units");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingUnits) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2">Loading units...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Select curriculum units that will be covered in this test. You can
          select multiple units.
        </p>
      </div>

      {units.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No units available for this grade and semester.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => handleToggleUnit(unit.id)}
            >
              <input
                type="checkbox"
                checked={selectedUnitIds.includes(unit.id)}
                onChange={() => handleToggleUnit(unit.id)}
                className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <p className="font-medium">{unit.unitName}</p>
                {unit.displayOrder && (
                  <p className="text-xs text-gray-500">
                    Order: {unit.displayOrder}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading || selectedUnitIds.length === 0}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : (
            "Next: Configure Questions →"
          )}
        </Button>
      </div>
    </div>
  );
}
