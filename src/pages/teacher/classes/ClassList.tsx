import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classService } from '@/services/classService';
import type {
  IClass,
  IClassQueryParams,
} from '@/types/class';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toastError, toastSuccess } from '@/lib/toast';

export default function ClassList() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    loadClasses();
  }, [currentPage, search, gradeFilter, termFilter, activeFilter]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const params: IClassQueryParams = {
        page: currentPage,
        limit: 12,
        search: search || undefined,
        grade: gradeFilter || undefined,
        term: termFilter || undefined,
        isActive: activeFilter,
      };

      const response = await classService.getAll(params);
      setClasses(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error: any) {
      console.error('Failed to load classes:', error);
      toastError(error?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete class "${name}"?`)) return;

    try {
      await classService.delete(id);
      loadClasses();
      toastSuccess('Class deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete class:', error);
      toastError(error?.message || 'Failed to delete class');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600 mt-1">Manage your classes and students</p>
        </div>
        <Button
          onClick={() => navigate('/teacher/classes/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Class
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Grades</option>
            <option value="E4">Elementary 4</option>
            <option value="E5">Elementary 5</option>
            <option value="E6">Elementary 6</option>
            <option value="M1">Middle 1</option>
            <option value="M2">Middle 2</option>
            <option value="M3">Middle 3</option>
          </select>

          {/* Term Filter */}
          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Terms</option>
            <option value="T1">Term 1</option>
            <option value="T2">Term 2</option>
          </select>

          {/* Active Filter */}
          <select
            value={activeFilter === undefined ? '' : activeFilter.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setActiveFilter(value === '' ? undefined : value === 'true');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && classes.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-600 mb-4">
            {search || gradeFilter || termFilter || activeFilter !== undefined
              ? 'Try adjusting your filters'
              : 'Create your first class to get started'}
          </p>
          {!search && !gradeFilter && !termFilter && activeFilter === undefined && (
            <Button
              onClick={() => navigate('/teacher/classes/new')}
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Class
            </Button>
          )}
        </div>
      )}

      {/* Classes Grid */}
      {!loading && classes.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{classItem.name}</h3>
                      <p className="text-blue-100 text-sm">
                        {classItem.grade} {classItem.term && `• ${classItem.term}`}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        classItem.isActive
                          ? 'bg-green-500 bg-opacity-20 text-white'
                          : 'bg-gray-500 bg-opacity-20 text-gray-200'
                      }`}
                    >
                      {classItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {classItem.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {classItem.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-gray-700 mb-4">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">
                      {classItem.studentCount || 0} students
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/teacher/classes/${classItem.id}`)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/teacher/classes/${classItem.id}/edit`)}
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(classItem.id, classItem.name)}
                      title="Delete"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-gray-700 flex items-center">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
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

