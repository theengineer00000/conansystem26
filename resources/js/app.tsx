import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import i18n, { initializeI18n } from './i18n'; // Import i18n configuration
import axios from 'axios';
import AppLoadingProvider from './components/app-loading-provider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Set up axios defaults and CSRF token
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true; // Important for sending cookies with cross-domain requests
const csrfToken = document.querySelector('meta[name="csrf-token"]');
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.getAttribute('content');
}

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize user preferences from props if available
        const authData = (props as any).initialPage.props as { auth?: { user?: any } };

        if (authData.auth?.user) {
            const { user } = authData.auth;
            
            // Set theme from user preferences from database ONLY  
            if (user.theme !== undefined) {
                let themeValue: 'dark' | 'light';
                if (user.theme === 1 || user.theme === '1') {
                    themeValue = 'dark';
                } else if (user.theme === 0 || user.theme === '0') {
                    themeValue = 'light';
                } else {
                    return; // Don't proceed with invalid theme
                }
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(themeValue);
                initializeTheme(themeValue);
            }

            // Set language from user preferences
            if (user.user_lang) {
                i18n.changeLanguage(user.user_lang);
                document.documentElement.dir = user.user_lang === 'ar' ? 'rtl' : 'ltr';
            }
        }

        root.render(
            <AppLoadingProvider>
                <App {...props} />
            </AppLoadingProvider>
        );
    },
    progress: {
        // Re-enable default progress bar
        color: '#4F46E5', // Indigo color
        showSpinner: false,
    }
});
