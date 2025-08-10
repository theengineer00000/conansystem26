import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconWrapper } from './icon-wrapper';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RtlChevron } from '@/components/ui/rtl-chevron';
import React from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { t } = useTranslation();
    const STORAGE_KEY = 'sidebar:open-groups';
    const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as Record<string, boolean>;
                if (parsed && typeof parsed === 'object') {
                    setOpenGroups(parsed);
                }
            }
        } catch (_) {}
    }, []);

    const setGroupOpen = React.useCallback((key: string, value: boolean) => {
        setOpenGroups((prev) => {
            const next = { ...prev, [key]: value };
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch (_) {}
            return next;
        });
    }, []);
    
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{t('menu.dashboard')}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    item.items && item.items.length > 0 ? (
                        <Collapsible key={item.title} asChild open={!!openGroups[item.href]} onOpenChange={(v) => setGroupOpen(item.href, v)}>
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                                        {item.icon && <IconWrapper icon={item.icon} className={item.className} />}
                                        <span className="flex-1 text-start">{item.title}</span>
                                        <RtlChevron className="size-4 opacity-70" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent asChild>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={`${item.title}-${subItem.title}`}>
                                                <SidebarMenuSubButton asChild>
                                                    <Link href={subItem.href} prefetch>
                                                        {subItem.icon && <IconWrapper icon={subItem.icon!} className={subItem.className} />}
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {item.icon && <IconWrapper icon={item.icon} className={item.className} />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
