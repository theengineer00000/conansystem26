import { useTranslation } from 'react-i18next';

export default function AppLogo() {
    const { t } = useTranslation();
    
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-transparent">
                <img 
                    src="/logo_with_background.png" 
                    alt="Logo" 
                    className="size-8 rounded-md object-contain" 
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">{t('app.name')}</span>
            </div>
        </>
    );
}
