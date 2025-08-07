import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import StatusMessage from '@/components/status-message';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/loading-spinner';
import { type BreadcrumbItem } from '@/types';
import InviteUsersDialog from '../components/InviteUsersDialog';

type CompanyDetailsProps = {
  companyId: string;
};

type CompanyUser = {
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
};

type CompanyData = {
  company_id: number;
  company_name: string;
  company_description: string;
};

const getBreadcrumbs = (t: (key: string) => string, companyName: string = ''): BreadcrumbItem[] => [
  {
    title: t('company.company_big_title'),
    href: '/settings/company',
  },
  {
    title: companyName || t('company.details.title'),
    href: '#',
  },
];

export default function CompanyDetails({ companyId }: CompanyDetailsProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [companyName, setCompanyName] = useState('');
  const breadcrumbs = getBreadcrumbs(t, companyName);
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchCompanyUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/company/${companyId}/users`);
        
        if (response.data.success) {
          setCompany(response.data.company);
          setUsers(response.data.users || []);
          setCompanyName(response.data.company.company_name || '');
          setCurrentUserRole(response.data.current_user_role || '');
          setError('');
        } else {
          setError(t('company.details.error_loading'));
          
          // Redirect back if company not found or no permission
          setTimeout(() => {
            router.visit('/settings/company');
          }, 2000);
        }
      } catch (err) {
        console.error('Error fetching company users:', err);
        setError(t('company.details.error_loading'));
        
        // Redirect back on error
        setTimeout(() => {
          router.visit('/settings/company');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanyUsers();
  }, [companyId, t]);

  const getRoleTranslation = (role: string) => {
    return t(`company.table.roles.${role?.toLowerCase() || 'employee'}`);
  };
  
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('company.details.title')} />
      
      <SettingsLayout>
        <div className="space-y-8">
          <div className="space-y-6">
            <HeadingSmall 
              title={t('company.details.title')}
              description={t('company.details.description')}
            />
            
            {error && (
              <StatusMessage 
                type="error" 
                message={error} 
              />
            )}
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner size={48} />
              </div>
            ) : company && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{t('company.details.users_list')}</h3>
                  {(currentUserRole === 'manager' || currentUserRole === 'hr') && (
                    <InviteUsersDialog 
                      companyId={company.company_id} 
                      onInvitesSent={() => {
                        // Refresh user list after sending invites
                        const fetchCompanyUsers = async () => {
                          try {
                            const response = await axios.get(`/company/${companyId}/users`);
                            if (response.data.success) {
                              setUsers(response.data.users || []);
                            }
                          } catch (err) {
                            console.error('Error refreshing company users:', err);
                          }
                        };
                        fetchCompanyUsers();
                      }}
                    />
                  )}
                </div>
                
                <Card className="overflow-hidden border shadow-none">
                  <div className="overflow-x-auto w-full max-w-full">
                    {users.length > 0 ? (
                      <table className={`w-full min-w-max ${isRTL ? "text-right" : "text-left"}`}>
                        <thead className="bg-muted/50">
                          <tr className="border-b">
                            <th className="px-4 py-3 font-medium">{t('company.details.table.name')}</th>
                            <th className="px-4 py-3 font-medium">{t('company.details.table.email')}</th>
                            <th className="px-4 py-3 font-medium">{t('company.details.table.role')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.user_id} className="border-b hover:bg-muted/50">
                              <td className="px-4 py-3" title={user.user_name}>
                                {user.user_name.length > 8 ? `${user.user_name.substring(0, 8)}...` : user.user_name}
                              </td>
                              <td className="px-4 py-3" title={user.user_email}>
                                {user.user_email.length > 12 ? `${user.user_email.substring(0, 12)}...` : user.user_email}
                              </td>
                              <td className="px-4 py-3">{getRoleTranslation(user.user_role)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center">
                        {t('company.details.no_users')}
                      </div>
                    )}
                  </div>
                </Card>
                
                <div className="flex">
                  <Button
                    type="button"
                    onClick={() => router.visit('/settings/company')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300"
                  >
                    {t('company.details.back_button')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}