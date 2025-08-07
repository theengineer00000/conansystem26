import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import CompanyTable from './components/CompanyTable';
import StatusMessage from '@/components/status-message';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '@/components/loading-spinner';
import InviteButton from './components/InviteButton';



const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
    {
        title: t('company.company_big_title'),
        href: '/settings/company',
    },
];



export default function CompanyIndex() {
    const { t } = useTranslation();
    const breadcrumbs = getBreadcrumbs(t);
    const [companylist, setCompanylist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchCompanyList = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/companylist');
                setCompanylist(response.data);
                setError('');
            } catch (err) {
                console.error('Error fetching companies:', err);
                setError(t('company.load_error'));
            } finally {
                setLoading(false);
            }
        };
        
        fetchCompanyList();
    }, []);
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('company.company_big_title')} />

            <SettingsLayout>
                <div className="space-y-8">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <HeadingSmall 
                                title={t('company.company_big_title')} 
                                description={t('company.company_description_text')} 
                            />
                            <div className="flex gap-2">
                                <InviteButton />
                                <Link 
                                    href="/settings/company/create" 
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    {t('company.create.button')}
                                </Link>
                            </div>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <LoadingSpinner size={48} />
                            </div>
                        ) : error ? (
                            <StatusMessage 
                                type="error"
                                message={error}
                            />
                        ) : (
                            <CompanyTable 
                                companies={companylist} 
                                onCompanyActivated={() => {
                                    const fetchCompanyList = async () => {
                                        try {
                                            const response = await axios.get('/companylist');
                                            setCompanylist(response.data);
                                        } catch (err) {
                                            console.error('Error fetching companies:', err);
                                        }
                                    };
                                    fetchCompanyList();
                                }} 
                            />
                        )}
                        <p>{t('company.note_for_company')}</p>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
