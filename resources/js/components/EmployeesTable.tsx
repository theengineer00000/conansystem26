import React from 'react';
import { Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

type Employee = {
  id: number;
  full_name: string;
  picture_url?: string;
  gender?: string;
  phone?: string;
  job_title?: string;
  department_name?: string;
  hire_date?: string;
  is_new?: number | boolean;
  is_active?: number | boolean;
  is_suspended?: number | boolean;
  is_deleted?: number | boolean;
  is_archived?: number | boolean;
};

type Labels = {
  picture?: string;
  name: string;
  gender: string;
  phone: string;
  job_title: string;
  department: string;
  hire_date: string;
  status: string;
};

export default function EmployeesTable({ employees, labels, isRTL = false, showPicture = false }: { employees: Employee[]; labels: Labels; isRTL?: boolean; showPicture?: boolean }) {
  const { t } = useTranslation();
  const getInitials = useInitials();
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto w-full max-w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-neutral-700 dark:scrollbar-track-neutral-900">
        <table className={cn("w-full min-w-max text-sm", isRTL ? "text-right" : "text-left") }>
          <thead className="bg-muted/50">
            <tr className="border-b">
              {showPicture && (
                <th className="px-4 py-3 font-medium w-0">{labels.picture ?? ''}</th>
              )}
              <th className="px-4 py-3 font-medium">{labels.name}</th>
              <th className="px-4 py-3 font-medium">{labels.gender}</th>
              <th className="px-4 py-3 font-medium">{labels.phone}</th>
              <th className="px-4 py-3 font-medium">{labels.job_title}</th>
              <th className="px-4 py-3 font-medium">{labels.department}</th>
              <th className="px-4 py-3 font-medium">{labels.hire_date}</th>
              <th className="px-4 py-3 font-medium">{labels.status}</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-muted/50">
                {showPicture && (
                  <td className="px-4 py-3 align-middle">
                    <Link href={`/employees/details/${emp.id}`} className="inline-block">
                      <Avatar className="size-9">
                        {emp.picture_url ? (
                          <AvatarImage src={emp.picture_url} alt={emp.full_name} />
                        ) : null}
                        <AvatarFallback>{getInitials(emp.full_name)}</AvatarFallback>
                      </Avatar>
                    </Link>
                  </td>
                )}
                <td className="px-4 py-3">
                  <Link href={`/employees/details/${emp.id}`} className="text-blue-600 hover:underline">
                    {emp.full_name}
                  </Link>
                  {emp.is_new ? (
                    <span className="ms-2 inline-flex items-center rounded-full bg-green-600/90 text-white text-[10px] px-2 py-0.5 align-middle">
                      {t('common.new', { defaultValue: 'New' })}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{emp.gender === 'male' ? t('employees.form.gender_male', { defaultValue: 'Male' }) : emp.gender === 'female' ? t('employees.form.gender_female', { defaultValue: 'Female' }) : '-'}</td>
                <td className="px-4 py-3">{emp.phone || '-'}</td>
                <td className="px-4 py-3">{emp.job_title || '-'}</td>
                <td className="px-4 py-3">{emp.department_name || '-'}</td>
                <td className="px-4 py-3">{emp.hire_date || '-'}</td>
                <td className="px-4 py-3">
                  {emp.is_active ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-600/90 text-white text-[10px] px-2 py-0.5">{t('employees.status_labels.active', { defaultValue: 'Active' })}</span>
                  ) : emp.is_suspended ? (
                    <span className="inline-flex items-center rounded-full bg-amber-600/90 text-white text-[10px] px-2 py-0.5">{t('employees.status_labels.suspended', { defaultValue: 'Suspended' })}</span>
                  ) : emp.is_archived ? (
                    <span className="inline-flex items-center rounded-full bg-blue-600/90 text-white text-[10px] px-2 py-0.5">{t('employees.status_labels.archived', { defaultValue: 'Archived' })}</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-neutral-500/80 text-white text-[10px] px-2 py-0.5">{t('employees.status_labels.unknown', { defaultValue: 'Unknown' })}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}


