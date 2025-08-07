import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import DeleteCompanyDialog from './DeleteCompanyDialog';

type Company = {
  company_id: number;
  company_name: string;
  company_active: number;
  company_role: string;
  is_owner: number;
}

export default function CompanyTable({ companies, onCompanyActivated }: { companies: Company[], onCompanyActivated?: () => void }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [loadingCompany, setLoadingCompany] = useState<number | null>(null);
  
  const activateCompany = async (companyId: number) => {
    try {
      setLoadingCompany(companyId);
      await axios.post(`/company/activate/${companyId}`);
      if (onCompanyActivated) {
        onCompanyActivated();
      }
    } catch (error) {
      console.error('Error activating company:', error);
    } finally {
      setLoadingCompany(null);
    }
  };
  
  if (!companies || companies.length === 0) {
    return (
      <Card className="p-4 text-center">
        <p>{t('company.no_companies')}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto w-full max-w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className={cn("w-full min-w-max", isRTL ? "text-right" : "text-left")}>
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 font-medium">{t('company.table.company_name')}</th>
              <th className="px-4 py-3 font-medium">{t('company.table.status')}</th>
              <th className="px-4 py-3 font-medium">{t('company.table.role')}</th>
              <th className="px-4 py-3 font-medium">{t('company.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.company_id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Link 
                    href={`/settings/company/details/${company.company_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {company.company_name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex" title={company.company_active ? t('company.table.active') : t('company.table.inactive')}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 640 640" 
                      className="w-5 h-5"
                      role="img"
                      aria-label={company.company_active ? t('company.table.active') : t('company.table.inactive')}
                    >
                      <path 
                        fill={company.company_active ? " #00a63e" : "#b0b0b0"} 
                        d="M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z"
                      />
                    </svg>
                  </div>
                </td>
                <td className="px-4 py-3">{t(`company.table.roles.${company.company_role?.toLowerCase() || 'employee'}`)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {company.company_active === 0 && (
                      <button
                        onClick={() => activateCompany(company.company_id)}
                        disabled={loadingCompany !== null}
                        className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-70"
                      >
                        {loadingCompany === company.company_id ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('loading.please_wait')}
                          </span>
                        ) : (
                          t('company.table.activate')
                        )}
                      </button>
                    )}
                    {company.is_owner === 1 && (
                      <>
                        <Link 
                          href={`/settings/company/edit/${company.company_id}`}
                          className="px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-70"
                        >
                          {t('company.table.edit')}
                        </Link>
                        
                        <DeleteCompanyDialog 
                          companyId={company.company_id} 
                          onCompanyDeleted={onCompanyActivated || (() => {})} 
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}