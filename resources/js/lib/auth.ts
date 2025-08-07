import { usePage } from '@inertiajs/react';
import { type Auth } from '@/types';

export function useAuth() {
  const { auth } = usePage().props as { auth?: Auth } || {};
  return auth;
}

export function useUser() {
  const auth = useAuth();
  return auth?.user;
}

export function getUserPreferences() {
  const user = useUser();
  if (!user) {
    return null;
  }

  let themeValue: 'dark' | 'light';
  if (user.theme === 1) {
    themeValue = 'dark';
  } else if (user.theme === 0) {
    themeValue = 'light';
  } else {
    throw new Error(`Invalid theme value: ${user.theme}`);
  }

  return {
    theme: themeValue,
    language: user.user_lang || 'ar',
    user_lang: user.user_lang || 'ar',
  };
}