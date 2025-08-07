import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { debounce } from 'lodash';

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
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import StatusMessage from '@/components/status-message';

type User = {
  id: number;
  name: string;
  email: string;
  has_invite?: boolean;
};

type SelectedUser = {
  id: number;
  name: string;
  email: string;
};

interface InviteUsersDialogProps {
  companyId: number;
  onInvitesSent?: () => void;
}

export default function InviteUsersDialog({ companyId, onInvitesSent }: InviteUsersDialogProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.post('/users/search', {
          email: query,
          company_id: companyId
        });

        if (response.data.success) {
          setSearchResults(response.data.users);
          setError('');
        } else {
          setSearchResults([]);
          setError(t('company.invite.search_error'));
        }
      } catch (err) {
        console.error('Error searching users:', err);
        setError(t('company.invite.search_error'));
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [companyId, t]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Add user to selected list
  const handleSelectUser = (user: User) => {
    // Check if user is already selected
    if (selectedUsers.some(u => u.id === user.id)) {
      return;
    }

    setSelectedUsers(prev => [...prev, {
      id: user.id,
      name: user.name,
      email: user.email
    }]);
    
    setSearchQuery('');
    setSearchResults([]);
  };

  // Remove user from selected list
  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  // Send invites to selected users
  const handleSendInvites = async () => {
    if (selectedUsers.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await axios.post('/company/invites/send', {
        company_id: companyId,
        user_ids: selectedUsers.map(user => user.id)
      });

      if (response.data.success) {
        setSuccess(t('company.invite.success'));
        
        // Clear selections after successful submission
        setSelectedUsers([]);
        
        // Notify parent component if callback provided
        if (onInvitesSent) {
          onInvitesSent();
        }
        
        // Close dialog after short delay
        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      } else {
        setError(t('company.invite.error'));
      }
    } catch (err) {
      console.error('Error sending invites:', err);
      setError(t('company.invite.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          {t('company.details.invite_button')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t('company.invite.title')}</DialogTitle>
        <DialogDescription>
          {t('company.invite.description')}
        </DialogDescription>

        <div className="space-y-4 mt-4">
          {/* Search input */}
          <div>
            <Input
              placeholder={t('company.invite.search_placeholder')}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>

          {/* Search results */}
          {isLoading && (
            <div className="text-center py-2">
              {t('common.loading')}...
            </div>
          )}
          
          {searchResults.length > 0 && (
            <Card className="overflow-hidden border">
              <div className="max-h-40 overflow-y-auto">
                <ul className="divide-y">
                  {searchResults.map((user) => (
                    <li 
                      key={user.id} 
                      className={`px-4 py-2 hover:bg-muted cursor-pointer ${user.has_invite ? 'opacity-50' : ''}`}
                      onClick={() => !user.has_invite && handleSelectUser(user)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        {user.has_invite && (
                          <span className="text-xs text-muted-foreground">{t('company.invite.already_invited')}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* Selected users table */}
          {selectedUsers.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">{t('company.invite.selected_users')}</h4>
              <Card className="overflow-hidden border">
                <table className={`w-full min-w-max ${isRTL ? "text-right" : "text-left"}`}>
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-2 font-medium text-sm">{t('company.details.table.name')}</th>
                      <th className="px-4 py-2 font-medium text-sm">{t('company.details.table.email')}</th>
                      <th className="px-4 py-2 font-medium text-sm w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-2 text-sm" title={user.name}>
                          {user.name.length > 15 ? `${user.name.substring(0, 15)}...` : user.name}
                        </td>
                        <td className="px-4 py-2 text-sm" title={user.email}>
                          {user.email.length > 15 ? `${user.email.substring(0, 15)}...` : user.email}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button 
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            {t('common.remove')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          ) : null}

          {/* Error/success message */}
          {error && <StatusMessage type="error" message={error} />}
          {success && <StatusMessage type="success" message={success} />}
        </div>

        <DialogFooter className="gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="secondary">
              {t('common.cancel')}
            </Button>
          </DialogClose>

          <Button 
            disabled={isSubmitting || selectedUsers.length === 0} 
            onClick={handleSendInvites}
          >
            {t('company.invite.send_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}