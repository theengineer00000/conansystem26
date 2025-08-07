import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Building } from 'lucide-react';
import AppLogo from './app-logo';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './language-switcher';
import React from 'react';
import { useUser } from '@/lib/auth';
import { Button } from './ui/button';

// Import HR application icons
import UsersSolidFullIcon from '@/components/icons/UsersSolidFullIcon';
import ClockSolidFullIcon from '@/components/icons/ClockSolidFullIcon';
import UmbrellaBeachSolidFullIcon from '@/components/icons/UmbrellaBeachSolidFullIcon';
import ClipboardListSolidFullIcon from '@/components/icons/ClipboardListSolidFullIcon';
import MoneyCheckDollarSolidFullIcon from '@/components/icons/MoneyCheckDollarSolidFullIcon';
import CoinsSolidFullIcon from '@/components/icons/CoinsSolidFullIcon';

export function createNavItems(t: (key: string) => string): { mainItems: NavItem[], footerItems: NavItem[] } {
    const mainNavItems: NavItem[] = [
        {
            title: t('menu.dashboard'),
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: t('menu.employees'),
            href: '/employees',
            icon: UsersSolidFullIcon,
        },
        {
            title: t('menu.attendances'),
            href: '/attendances',
            icon: ClockSolidFullIcon,
        },
        {
            title: t('menu.vacations'),
            href: '/vacations',
            icon: UmbrellaBeachSolidFullIcon,
        },
        {
            title: t('menu.requests'),
            href: '/requests',
            icon: ClipboardListSolidFullIcon,
        },
        {
            title: t('menu.payroll'),
            href: '/payroll',
            icon: MoneyCheckDollarSolidFullIcon,
        },
        {
            title: t('menu.accounting'),
            href: '/accounting',
            icon: CoinsSolidFullIcon,
        },
    ];

    const footerNavItems: NavItem[] = [
        // {
        //     title: t('menu.companies'),
        //     href: '/settings/company',
        //     icon: Building,
        // },
    ];
    
    return { mainItems: mainNavItems, footerItems: footerNavItems };
};

function NoActiveCompanyMessage() {
    const { t } = useTranslation();
    
    return (
        <SidebarGroup className="px-4 py-6">
            <div className="flex flex-col items-center text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                    {t('messages.no_active_company')}
                </p>
                <Button asChild variant="outline" className="w-full">
                    <Link href="/settings/company">
                        {t('menu.companies')}
                    </Link>
                </Button>
            </div>
        </SidebarGroup>
    );
}

export function AppSidebar() {
    const { t, i18n } = useTranslation();
    const { mainItems, footerItems } = createNavItems(t);
    const isRTL = i18n.language === 'ar';
    const user = useUser();
    const hasActiveCompany = user?.has_active_company;
    
    // Set RTL direction and sidebar position on mount and when language changes
    React.useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        
        if (isRTL) {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }, [isRTL]);

    return (
        <Sidebar collapsible="icon" variant="inset" side={isRTL ? 'right' : 'left'}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {hasActiveCompany ? (
                    <NavMain items={mainItems} />
                ) : (
                    <NoActiveCompanyMessage />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
