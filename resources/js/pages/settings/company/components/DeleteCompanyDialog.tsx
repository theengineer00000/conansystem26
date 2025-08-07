import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useForm } from '@inertiajs/react';

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
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
// Icon removed per user request

interface DeleteCompanyDialogProps {
  companyId: number;
  onCompanyDeleted: () => void;
}

export default function DeleteCompanyDialog({ companyId, onCompanyDeleted }: DeleteCompanyDialogProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);
  const { data, setData, processing, reset, errors } = useForm({
    password: '',
  });

  const closeModal = () => {
    setIsOpen(false);
    reset();
  };

  const deleteCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.post(`/company/delete/${companyId}`, data);
      closeModal();
      onCompanyDeleted();
    } catch (error: any) {
      if (error.response?.status === 403) {
        setData('password', '');
        if (passwordInput.current) {
          passwordInput.current.focus();
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-70"
        >
          {t('company.table.delete')}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t('company.delete.confirmation')}</DialogTitle>
        <DialogDescription>
          {t('company.delete.explanation')}
        </DialogDescription>
        <form className="space-y-6" onSubmit={deleteCompany}>
          <div className="grid gap-2">
            {/* Hidden username field for accessibility */}
            <Input
              id="username"
              type="text"
              name="username"
              className="hidden"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden="true"
            />
            
            <Label htmlFor="password" className="sr-only">
              {t('common.password')}
            </Label>

            <Input
              id="password"
              type="password"
              name="password"
              ref={passwordInput}
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder={t('common.password')}
              autoComplete="current-password"
            />

            <InputError message={errors.password} />
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="secondary" onClick={closeModal}>
                {t('common.cancel')}
              </Button>
            </DialogClose>

            <Button variant="destructive" disabled={processing} asChild>
              <button type="submit">{t('company.delete.button')}</button>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}