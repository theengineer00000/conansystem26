import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusMessage from '@/components/status-message';
import LoadingSpinner from '@/components/loading-spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Props = { jobPositionId: string };

export default function JobPositionDetails({ jobPositionId }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isStatusBusy, setIsStatusBusy] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('job_positions.title'), href: '/job-positions' },
    { title: position?.name || t('job_positions.details.title'), href: '#' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/job-position/${jobPositionId}`);
        if (res.data?.success && res.data?.data) {
          setPosition(res.data.data);
        } else {
          setMessage({ type: 'error', text: res.data?.message || t('job_positions.load_error') });
        }
      } catch (e) {
        setMessage({ type: 'error', text: t('job_positions.load_error') });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobPositionId, t]);

  const updateStatus = async (status: 'archived' | 'active' | 'deleted') => {
    try {
      setIsStatusBusy(true);
      const res = await axios.post(`/api/job-position/status/${jobPositionId}`, { status });
      if (res.data?.success) {
        if (status === 'deleted') {
          router.visit('/job-positions');
          return;
        }
        setPosition({ ...position, is_archived: status === 'archived' ? 1 : 0 });
        setMessage({ type: 'success', text: t('job_positions.status_updated') });
      } else {
        setMessage({ type: 'error', text: res.data?.message || t('job_positions.update_error') });
      }
    } finally {
      setIsStatusBusy(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={position?.name || t('job_positions.details.title')} />

      <div className="space-y-8 p-4 md:p-6 max-w-[800px] w-full mx-auto">
        <HeadingSmall 
          title={position?.name || t('job_positions.details.title')} 
          description={t('job_positions.details.description')} 
        />

        {message && (
          <StatusMessage type={message.type} message={message.text} />
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size={28} />
          </div>
        ) : position ? (
          <>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t('job_positions.form.name')}</h3>
                  <p className="text-lg">{position.name}</p>
                </div>
                
                {/* No admin field in job_position */}
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t('job_positions.table.status')}</h3>
                  <p className="text-lg">
                    {position.is_archived ? (
                      <span className="inline-flex items-center rounded-full bg-orange-600/90 text-white text-sm px-3 py-1">
                        {t('job_positions.status.archived')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-600/90 text-white text-sm px-3 py-1">
                        {t('job_positions.status.active')}
                      </span>
                    )}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t('job_positions.details.created_at')}</h3>
                  <p className="text-lg">{position.created_at || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t('job_positions.details.updated_at')}</h3>
                  <p className="text-lg">{position.updated_at || '-'}</p>
                </div>
              </div>
            </Card>

            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <Link href="/job-positions">
                  <Button variant="outline">{t('common.back')}</Button>
                </Link>
                <Link href={`/job-positions/edit/${jobPositionId}`}>
                  <Button>{t('common.edit')}</Button>
                </Link>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => updateStatus(position.is_archived ? 'active' : 'archived')} 
                  className={position.is_archived ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} 
                  disabled={isStatusBusy}
                >
                  {position.is_archived ? t('job_positions.activate') : t('job_positions.archive')}
                </Button>
                <Button 
                  onClick={() => updateStatus('deleted')} 
                  variant="destructive" 
                  disabled={isStatusBusy}
                >
                  {t('job_positions.delete')}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">{t('job_positions.not_found')}</p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
