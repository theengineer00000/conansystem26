import { Head } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import UserPreferencesForm from '@/components/user-preferences-form';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useTranslation } from 'react-i18next';

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
    {
        title: t('settings.appearance'),
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    const { t } = useTranslation();
    const breadcrumbs = getBreadcrumbs(t);
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.appearance')} />

            <SettingsLayout>
                <div className="space-y-8">
                    <div className="space-y-6">
                        <HeadingSmall 
                            title={t('settings.user_preferences')} 
                            description={t('settings.update_preferences')} 
                        />
                        <UserPreferencesForm />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
