import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function InviteButton() {
  const { t } = useTranslation();
  const [hasPendingInvites, setHasPendingInvites] = useState(false);

  useEffect(() => {
    // Check for pending invites when component mounts
    checkPendingInvites();
  }, []);

  const checkPendingInvites = async () => {
    try {
      const response = await axios.get('/user/invites/pending');
      if (response.data.success) {
        setHasPendingInvites(response.data.has_pending_invites);
      }
    } catch (error) {
      console.error('Error checking pending invites:', error);
    }
  };

  return (
    <Link
      href="/settings/company/invites"
      className="relative px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
    >
      {hasPendingInvites && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
      {t('company.invites.view_button')}
    </Link>
  );
}