import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/action-button';
import { Card } from '@/components/ui/card';
import StatusMessage from '@/components/status-message';
import LoadingSpinner from '@/components/loading-spinner';

type Invite = {
  id: number;
  source_user_id: number;
  target_user_id: number;
  company_id: number;
  status: number;
  created_at: string;
  source_name: string;
  target_name: string;
  source_email: string;
  target_email: string;
  company_name: string;
};

export default function UserInvitesDialog() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const locale = isRTL ? ar : enUS;
  
  const [isOpen, setIsOpen] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Load user invites when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchUserInvites();
    } else {
      // Reset state when dialog closes
      setSuccess('');
      setError('');
    }
  }, [isOpen]);

  // Fetch current user ID and invites
  const fetchUserInvites = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get user invites
      const response = await axios.get('/user/invites');
      
      if (response.data.success) {
        const invitesData = response.data.invites || [];
        setInvites(invitesData);
        
        // Set the current user ID from the API response
        if (response.data.current_user_id) {
          setCurrentUserId(response.data.current_user_id);
        }
      } else {
        setError(t('company.invites.error_loading'));
      }
    } catch (err) {
      console.error('Error fetching invites:', err);
      setError(t('company.invites.error_loading'));
    } finally {
      setIsLoading(false);
    }
  };

  // Format invite status
  const formatStatus = (status: number) => {
    switch (status) {
      case 0:
        return t('company.invites.status.rejected');
      case 1:
        return t('company.invites.status.accepted');
      case 2:
      default:
        return t('company.invites.status.pending');
    }
  };

  // Get status class for styling
  const getStatusClass = (status: number) => {
    switch (status) {
      case 0:
        return 'text-red-600';
      case 1:
        return 'text-green-600';
      case 2:
      default:
        return 'text-yellow-600';
    }
  };

  // Format date as "time ago"
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale });
    } catch {
      return dateString;
    }
  };

  // Handle invite acceptance
  const handleAccept = async (inviteId: number) => {
    try {
      setError('');
      const response = await axios.post(`/user/invites/accept/${inviteId}`);
      
      if (response.data.success) {
        setSuccess(t('company.invites.accept_success'));
        // Refresh invites list
        fetchUserInvites();
      } else {
        setError(t('company.invites.accept_error'));
      }
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError(t('company.invites.accept_error'));
    }
  };

  // Handle invite rejection
  const handleReject = async (inviteId: number) => {
    try {
      setError('');
      const response = await axios.post(`/user/invites/reject/${inviteId}`);
      
      if (response.data.success) {
        setSuccess(t('company.invites.reject_success'));
        // Refresh invites list
        fetchUserInvites();
      } else {
        setError(t('company.invites.reject_error'));
      }
    } catch (err) {
      console.error('Error rejecting invite:', err);
      setError(t('company.invites.reject_error'));
    }
  };

  // Handle invite deletion
  const handleDelete = async (inviteId: number) => {
    try {
      setError('');
      const response = await axios.delete(`/user/invites/delete/${inviteId}`);
      
      if (response.data.success) {
        setSuccess(t('company.invites.delete_success'));
        // Refresh invites list
        fetchUserInvites();
      } else {
        setError(t('company.invites.delete_error'));
      }
    } catch (err) {
      console.error('Error deleting invite:', err);
      setError(t('company.invites.delete_error'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="px-4 py-2 text-sm font-medium border-blue-600 text-blue-600 hover:bg-blue-50">
          {t('company.invites.view_button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogTitle>{t('company.invites.title')}</DialogTitle>
        <DialogDescription>
          {t('company.invites.description')}
        </DialogDescription>

        <div className="space-y-4 mt-4">
          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center p-8">
              <LoadingSpinner size={48} />
            </div>
          )}

          {/* Error/success messages */}
          {error && <StatusMessage type="error" message={error} />}
          {success && <StatusMessage type="success" message={success} />}

          {/* Invites table */}
          {!isLoading && invites.length > 0 ? (
            <Card className="overflow-hidden border">
              <div className="overflow-x-auto">
                <table className={`w-full min-w-max ${isRTL ? "text-right" : "text-left"}`}>
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 font-medium text-sm">{t('company.invites.table.sender')}</th>
                      <th className="px-4 py-3 font-medium text-sm">{t('company.invites.table.recipient')}</th>
                      <th className="px-4 py-3 font-medium text-sm">{t('company.invites.table.company')}</th>
                      <th className="px-4 py-3 font-medium text-sm">{t('company.invites.table.status')}</th>
                      <th className="px-4 py-3 font-medium text-sm">{t('company.invites.table.date')}</th>
                      <th className="px-4 py-3 font-medium text-sm">{t('company.invites.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">
                          {invite.source_name}
                          <div className="text-xs text-muted-foreground">{invite.source_email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {invite.target_name}
                          <div className="text-xs text-muted-foreground">{invite.target_email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">{invite.company_name}</td>
                        <td className={`px-4 py-3 text-sm ${getStatusClass(invite.status)}`}>
                          {formatStatus(invite.status)}
                        </td>
                        <td className="px-4 py-3 text-sm">{formatTimeAgo(invite.created_at)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            {/* 
                              Show accept/reject buttons only if:
                              1. The invite status is pending (status = 2)
                              2. The current user is the target (recipient) of the invite
                            */}
                            {invite.status === 2 && invite.target_user_id === currentUserId && (
                              <>
                                <ActionButton
                                  onClick={() => handleAccept(invite.id)}
                                  color="green"
                                >
                                  {t('company.invites.accept')}
                                </ActionButton>
                                <ActionButton
                                  onClick={() => handleReject(invite.id)}
                                  color="orange"
                                >
                                  {t('company.invites.reject')}
                                </ActionButton>
                              </>
                            )}
                            {/* Show delete button to both source and target users */}
                            <ActionButton
                              onClick={() => handleDelete(invite.id)}
                              color="red"
                            >
                              {t('company.invites.delete')}
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : !isLoading && (
            <div className="text-center p-8 bg-muted/20 rounded-md">
              {t('company.invites.no_invites')}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="secondary">
              {t('common.close')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}