import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Employee = {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  hire_date?: string;
};

type Labels = {
  name: string;
  email: string;
  phone: string;
  job_title: string;
  hire_date: string;
};

export default function EmployeesTable({ employees, labels, isRTL = false }: { employees: Employee[]; labels: Labels; isRTL?: boolean }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto w-full max-w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-neutral-700 dark:scrollbar-track-neutral-900">
        <table className={cn("w-full min-w-max text-sm", isRTL ? "text-right" : "text-left") }>
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 font-medium">{labels.name}</th>
              <th className="px-4 py-3 font-medium">{labels.email}</th>
              <th className="px-4 py-3 font-medium">{labels.phone}</th>
              <th className="px-4 py-3 font-medium">{labels.job_title}</th>
              <th className="px-4 py-3 font-medium">{labels.hire_date}</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3">{emp.full_name}</td>
                <td className="px-4 py-3">{emp.email || '-'}</td>
                <td className="px-4 py-3">{emp.phone || '-'}</td>
                <td className="px-4 py-3">{emp.job_title || '-'}</td>
                <td className="px-4 py-3">{emp.hire_date || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}


