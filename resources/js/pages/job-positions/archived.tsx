import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusMessage from '@/components/status-message';
import LoadingSpinner from '@/components/loading-spinner';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import BoxArchiveSolidFullIcon from '@/components/icons/BoxArchiveSolidFullIcon';

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
  {
    title: t('job_positions.title'),
    href: '/job-positions',
  },
  {
    title: t('job_positions.archived_title'),
    href: '/job-positions/archived',
  },
];

export default function JobPositionsArchived() {
  const { t, i18n } = useTranslation();
  const breadcrumbs = getBreadcrumbs(t);
  const [jobPositions, setJobPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [perPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchJobPositions = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/job-positions', {
          params: { page: pageNum, per_page: perPage, search, archived: 1 }
        });
        if (res.data) {
          setJobPositions(res.data.data || []);
          setTotalPages(res.data.last_page || 1);
          setTotalCount(res.data.total || 0);
        }
      } catch (e) {
        setErrorMsg(t('job_positions.load_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchJobPositions();
  }, [pageNum, perPage, search]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('job_positions.archived_title')} />

      <div className="space-y-8 p-4 md:p-6 max-w-[1200px] w-full mx-auto">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <BoxArchiveSolidFullIcon className="size-8 text-orange-600 fill-orange-600" />
            <HeadingSmall
              title={t('job_positions.archived_title')}
              description={t('job_positions.archived_description')}
            />
          </div>

          <div className="flex items-center gap-3">
            <Input
              placeholder={t('job_positions.search_placeholder')}
              value={search}
              onChange={(e) => {
                setPageNum(1);
                setSearch(e.target.value);
              }}
              dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              className="w-64"
            />
          </div>
        </div>

        {errorMsg && (
          <StatusMessage type="error" message={errorMsg} />
        )}

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 text-sm border-b bg-muted/40">
            <div>{t('job_positions.total_archived_label')}: {totalCount}</div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size={28} />
            </div>
          ) : jobPositions.length === 0 ? (
            <div className="p-6 text-sm">{t('job_positions.no_archived_positions')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className={cn("w-full text-sm", i18n.language === 'ar' ? "text-right" : "text-left")}>
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 font-medium">{t('job_positions.table.name')}</th>
                    <th className="px-4 py-3 font-medium">{t('job_positions.table.status')}</th>
                    <th className="px-4 py-3 font-medium">{t('job_positions.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {jobPositions.map((position) => (
                    <tr key={position.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <Link href={`/job-positions/details/${position.id}`} className="text-blue-600 hover:underline">
                          {position.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-orange-600/90 text-white text-[10px] px-2 py-0.5">
                          {t('job_positions.status.archived')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/job-positions/edit/${position.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {t('common.edit')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Pagination
          currentPage={pageNum}
          totalPages={totalPages}
          onPageChange={(p) => setPageNum(p)}
          isLoading={loading}
          prevLabel={t('common.back')}
          nextLabel={t('common.next')}
          alwaysCompact
          className="mt-4"
        />
      </div>
    </AppLayout>
  );
}
