import { useState } from 'react';
import { useAdtmTemplates, useUpdateTemplateStatus } from '@/hooks/useAdtmTemplates';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Badge,
} from '@/components/ui';
import { TestStatus } from '@shared/types/enum';
import { Search, Eye, BarChart3, Loader2, Power, PowerOff } from 'lucide-react';
import { format } from 'date-fns';
import { AdtmTemplateDetailsModal } from '@/components/admin/AdtmTemplateDetailsModal';
import { AdtmTemplateStatisticsModal } from '@/components/admin/AdtmTemplateStatisticsModal';
import type { AdtmTemplate } from '@/types/adtm-template.types';

const LEVEL_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: 'Elementary', label: 'Elementary' },
  { value: 'Middle School', label: 'Middle School' },
  { value: 'High School', label: 'High School' },
];

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: TestStatus.PUBLISHED, label: 'Active' },
  { value: TestStatus.ARCHIVED, label: 'Inactive' },
];

export function AdtmTemplatesPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    level: '',
    status: 'All' as 'All' | TestStatus,
    search: '',
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);

  const { data, isLoading, error } = useAdtmTemplates(filters);
  const updateStatus = useUpdateTemplateStatus();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleToggleStatus = async (template: AdtmTemplate) => {
    try {
      await updateStatus.mutateAsync({
        id: template.id,
        isActive: !template.isActive,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to update template status');
    }
  };

  const handleViewDetails = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setDetailsModalOpen(true);
  };

  const handleViewStatistics = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setStatisticsModalOpen(true);
  };

  const getLevelBadge = (grade: string) => {
    if (grade.startsWith('E')) {
      return <Badge variant="info">Elementary</Badge>;
    } else if (grade.startsWith('M')) {
      return <Badge variant="info">Middle School</Badge>;
    } else {
      return <Badge variant="info">High School</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-red-600">
              Error loading templates: {(error as Error).message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">A-DTM Templates</h1>
        <p className="text-secondary-500 mt-1">Manage and view all A-DTM test templates</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <Input
                placeholder="Search by code or name..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={LEVEL_OPTIONS}
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            />
            <Select
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {data && data.templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  {getLevelBadge(template.grade)}
                  <button
                    onClick={() => handleToggleStatus(template)}
                    className="text-secondary-600 hover:text-primary-600 transition-colors"
                    disabled={updateStatus.isPending}
                    title={template.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {template.isActive ? (
                      <Power className="w-6 h-6 text-green-600" />
                    ) : (
                      <PowerOff className="w-6 h-6 text-secondary-400" />
                    )}
                  </button>
                </div>
                <CardTitle className="mt-2 text-lg">{template.testCode}</CardTitle>
                <p className="text-sm text-secondary-600 mt-1">{template.title}</p>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-secondary-500">Grade</p>
                    <p className="text-sm font-medium">{template.grade}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">Semester</p>
                    <p className="text-sm font-medium">{template.semester}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">Total Score</p>
                    <p className="text-sm font-medium">{template.totalScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">Questions</p>
                    <p className="text-sm font-medium">{template.questionCount}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="default" className="text-xs">
                    S1: {template.section1Count}Q
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    S2: {template.section2Count}Q
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    S3: {template.section3Count}Q
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    S4: 4Q
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    S5: 4Q
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-secondary-500">
                  <span>
                    {template.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="default">Inactive</Badge>
                    )}
                  </span>
                  <span>{format(new Date(template.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>

              <div className="p-4 border-t border-secondary-200 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(template.id)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewStatistics(template.id)}
                  className="flex-1"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Stats
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-secondary-500">No templates found</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            Showing {((data.page - 1) * filters.limit + 1).toLocaleString()} to{' '}
            {Math.min(data.page * filters.limit, data.total).toLocaleString()} of{' '}
            {data.total.toLocaleString()} templates
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={data.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={data.page >= data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AdtmTemplateDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedTemplateId(null);
        }}
        templateId={selectedTemplateId}
      />

      <AdtmTemplateStatisticsModal
        isOpen={statisticsModalOpen}
        onClose={() => {
          setStatisticsModalOpen(false);
          setSelectedTemplateId(null);
        }}
        templateId={selectedTemplateId}
      />
    </div>
  );
}

