import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
} from "@/components/ui";
import { Plus, User, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui";

interface Student {
  id: string;
  username: string;
  fullName: string;
  email: string;
}

export function AdtmStudents() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: students, isLoading } = useQuery({
    queryKey: ["students", searchTerm],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: Student[];
        timestamp: string;
      }>("/users", {
        params: {
          role: "STUDENT",
          search: searchTerm || undefined,
        },
      });
      return response.data.data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            A-DTM Students
          </h1>
          <p className="text-secondary-600 mt-1">
            Manage students for A-DTM test grading
          </p>
        </div>
        <Button onClick={() => navigate("/teacher/adtm/register")}>
          <Plus className="w-4 h-4 mr-2" />
          Register Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <Input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-secondary-600">Loading students...</p>
            </div>
          ) : students && students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card
                  key={student.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    navigate(`/teacher/adtm/register?studentId=${student.id}`)
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-secondary-900">
                          {student.fullName}
                        </h3>
                        <p className="text-sm text-secondary-600">
                          {student.username}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary-600">No students found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
