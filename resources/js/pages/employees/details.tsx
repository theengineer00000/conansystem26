import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import StatusMessage, { type StatusMessageType } from '@/components/status-message';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
// Lightweight debounce to avoid extra type deps
function debounce<F extends (...args: any[]) => void>(fn: F, wait = 300) {
  let timeout: any;
  return function(this: any, ...args: Parameters<F>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  } as F;
}
import InviteUsersDialog from '@/pages/settings/company/components/InviteUsersDialog';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import LoadingSpinner from '@/components/loading-spinner';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
// removed duplicate import

type Props = { employeeId: string };

const getBreadcrumbs = (t: (key: string, options?: any) => string, name: string = ''): BreadcrumbItem[] => [
  { title: t('employees.employees_big_title'), href: '/employees' },
  { title: name || t('employees.details.title', { defaultValue: 'Employee Details' }), href: '#' },
];

export default function EmployeeDetails({ employeeId }: Props) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: StatusMessageType; text: string } | null>(null);
  const [empName, setEmpName] = useState('');
  const breadcrumbs = getBreadcrumbs(t, empName);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusFlags, setStatusFlags] = useState({ is_active: 0, is_suspended: 0, is_archived: 0, is_deleted: 0 });

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`/employee/${employeeId}`);
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setFormData({
            full_name: d.full_name || '',
            email: d.email || '',
            phone: d.phone || '',
            national_id: d.national_id || '',
            job_title: d.job_title || '',
            department_id: d.department_id ?? '',
            manager_id: d.manager_id ?? '',
            hire_date: d.hire_date || '',
            work_location: d.work_location || '',
            address: d.address || '',
            country: d.country || '',
            city: d.city || '',
            salary: d.salary ?? '',
            currency: d.currency || 'usd',
            bank_name: d.bank_name || '',
            bank_account_number: d.bank_account_number || '',
            iban: d.iban || '',
            birth_date: d.birth_date || '',
            gender: d.gender || '',
            marital_status: d.marital_status || '',
            nationality: d.nationality || '',
            emergency_contact: d.emergency_contact || '',
          });
          setEmpName(d.full_name || '');
          setStatusFlags({
            is_active: Number(d.is_active || 0),
            is_suspended: Number(d.is_suspended || 0),
            is_archived: Number(d.is_archived || 0),
            is_deleted: Number(d.is_deleted || 0),
          });
        } else {
          const serverMsg = (res.data && res.data.message) ? String(res.data.message) : '';
          setMessage({ type: 'error', text: serverMsg || t('employees.details.load_error', { defaultValue: 'Failed to load employee' }) });
        }
      } catch (e) {
        // Try to surface server message if possible
        const anyErr = e as any;
        const serverMsg = anyErr?.response?.data?.message ? String(anyErr.response.data.message) : '';
        setMessage({ type: 'error', text: serverMsg || t('employees.details.load_error', { defaultValue: 'Failed to load employee' }) });
      } finally {
        setIsLoading(false);
      }
    };
    loadEmployee();
  }, [employeeId, t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!String(formData.full_name || '').trim()) newErrors.full_name = t('validation.required', { defaultValue: 'Required' });
    if (!String(formData.phone || '').trim()) newErrors.phone = t('validation.required', { defaultValue: 'Required' });
    if (!String(formData.national_id || '').trim()) newErrors.national_id = t('validation.required', { defaultValue: 'Required' });
    if (!String(formData.hire_date || '').trim()) newErrors.hire_date = t('validation.required', { defaultValue: 'Required' });
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.email))) newErrors.email = t('validation.email', { defaultValue: 'Invalid email' });
    if (formData.salary !== '' && isNaN(Number(formData.salary))) newErrors.salary = t('validation.numeric', { defaultValue: 'Must be a number' });
    if (formData.department_id !== '' && isNaN(Number(formData.department_id))) newErrors.department_id = t('validation.numeric', { defaultValue: 'Must be a number' });
    if (formData.manager_id !== '' && isNaN(Number(formData.manager_id))) newErrors.manager_id = t('validation.numeric', { defaultValue: 'Must be a number' });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setMessage(null);
    try {
      const payload: Record<string, any> = {
        ...formData,
        salary: formData.salary !== '' ? Number(formData.salary) : undefined,
        department_id: formData.department_id !== '' ? Number(formData.department_id) : undefined,
        manager_id: formData.manager_id !== '' ? Number(formData.manager_id) : undefined,
      };
      const res = await axios.post(`/employee/update/${employeeId}`, payload);
      if (res.data?.success) {
        setMessage({ type: 'success', text: t('employees.details.update_success', { defaultValue: 'Employee updated successfully' }) });
      } else if (res.data?.errors) {
        const serverErrors = res.data.errors as Record<string, string[]>;
        const flat: Record<string, string> = {};
        Object.entries(serverErrors).forEach(([key, arr]) => {
          if (Array.isArray(arr) && arr.length > 0) flat[key] = arr[0];
        });
        setErrors(flat);
        const serverMsg = (res.data && res.data.message) ? String(res.data.message) : '';
        setMessage({ type: 'error', text: serverMsg || t('employees.details.update_error', { defaultValue: 'Failed to update employee' }) });
      } else {
        const serverMsg = (res.data && res.data.message) ? String(res.data.message) : '';
        setMessage({ type: 'error', text: serverMsg || t('employees.details.update_error', { defaultValue: 'Failed to update employee' }) });
      }
    } catch (e) {
      const anyErr = e as any;
      const serverMsg = anyErr?.response?.data?.message ? String(anyErr.response.data.message) : '';
      setMessage({ type: 'error', text: serverMsg || t('employees.details.update_error', { defaultValue: 'Failed to update employee' }) });
    }
  };

  const updateStatus = async (
    status: 'active' | 'suspended' | 'archived' | 'deleted',
    password?: string,
  ): Promise<{ ok: boolean; message?: string }> => {
    try {
      const res = await axios.post(`/employee/status/${employeeId}`, { status, password });
      if (res.data?.success) {
        if (status === 'deleted') {
          // Redirect away from details page after delete
          router.visit('/employees');
          return { ok: true };
        }
        setMessage({ type: 'success', text: t('employees.details.status_updated', { defaultValue: 'Employee status updated successfully' }) });
        setStatusFlags(
          status === 'active'
            ? { is_active: 1, is_suspended: 0, is_archived: 0, is_deleted: 0 }
            : status === 'suspended'
            ? { is_active: 0, is_suspended: 1, is_archived: 0, is_deleted: 0 }
            : { is_active: 0, is_suspended: 0, is_archived: 1, is_deleted: 0 }
        );
        return { ok: true };
      } else {
        const msg = (res.data && res.data.message) ? String(res.data.message) : '';
        if (status === 'deleted') {
          return { ok: false, message: msg || t('employees.details.status_update_failed', { defaultValue: 'Failed to update employee status' }) };
        }
        setMessage({ type: 'error', text: msg || t('employees.details.status_update_failed', { defaultValue: 'Failed to update employee status' }) });
        return { ok: false, message: msg };
      }
    } catch (e) {
      const anyErr = e as any;
      const serverMsg = anyErr?.response?.data?.message ? String(anyErr.response.data.message) : '';
      if (status === 'deleted') {
        return { ok: false, message: serverMsg || t('employees.details.status_update_failed', { defaultValue: 'Failed to update employee status' }) };
      }
      setMessage({ type: 'error', text: serverMsg || t('employees.details.status_update_failed', { defaultValue: 'Failed to update employee status' }) });
      return { ok: false, message: serverMsg };
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('employees.details.title', { defaultValue: 'Employee Details' })} />
      <div className="space-y-8 p-4 md:p-6 max-w-[1500px] w-full mx-auto">
        <HeadingSmall
          title={t('employees.details.title', { defaultValue: 'Employee Details' })}
          description={t('employees.details.description', { defaultValue: 'View and edit employee information' })}
        />

        {message && <StatusMessage type={message.type} message={message.text} />}

        {!isLoading && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {Number(statusFlags.is_active) === 0 && Number(statusFlags.is_deleted) === 0 && (
              <Button onClick={() => updateStatus('active')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {t('employees.details.activate')}
              </Button>
            )}
            {Number(statusFlags.is_suspended) === 0 && Number(statusFlags.is_deleted) === 0 && (
              <Button onClick={() => updateStatus('suspended')} className="bg-amber-600 hover:bg-amber-700 text-white">
                {t('employees.details.suspend')}
              </Button>
            )}
            {Number(statusFlags.is_archived) === 0 && Number(statusFlags.is_deleted) === 0 && (
              <Button onClick={() => updateStatus('archived')} className="bg-blue-600 hover:bg-blue-700 text-white">
                {t('employees.details.archive')}
              </Button>
            )}
            {Number(statusFlags.is_deleted) === 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    {t('employees.details.delete')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>{t('employees.details.confirm_delete_title')}</DialogTitle>
                  <DialogDescription>{t('employees.details.confirm_delete_text')}</DialogDescription>
                  <DeleteEmployeeConfirm onConfirm={async (password, setFieldError) => {
                    const res = await updateStatus('deleted', password);
                    if (!res.ok && res.message) {
                      setFieldError(res.message);
                    }
                  }} />
                </DialogContent>
              </Dialog>
            )}

            {/* Link employee to user */}
            {Number(statusFlags.is_deleted) === 0 && (
              <LinkEmployeeDialog employeeId={Number(employeeId)} />
            )}
          </div>
        )}

        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner size={48} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-md border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-900 dark:text-blue-200">
                {t('employees.required_hint', { defaultValue: 'Fields marked with * are required' })}
              </div>

              {/* Basic Identity */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold">{t('employees.sections.basic_info')}</h3>
                  <p className="text-sm text-muted-foreground">{t('employees.sections.basic_info_desc')}</p>
                </div>
                <div className="rounded-lg border p-4 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="full_name">{t('employees.form.full_name')} *</Label>
                      <Input id="full_name" name="full_name" value={formData.full_name || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.full_name} />
                      <InputError message={errors.full_name} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">{t('employees.form.email')}</Label>
                      <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.email} />
                      <InputError message={errors.email} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">{t('employees.form.phone')} *</Label>
                      <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.phone} />
                      <InputError message={errors.phone} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="national_id">{t('employees.form.national_id')} *</Label>
                      <Input id="national_id" name="national_id" value={formData.national_id || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.national_id} />
                      <InputError message={errors.national_id} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold">{t('employees.sections.employment_info')}</h3>
                  <p className="text-sm text-muted-foreground">{t('employees.sections.employment_info_desc')}</p>
                </div>
                <div className="rounded-lg border p-4 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="job_title">{t('employees.form.job_title')}</Label>
                      <Input id="job_title" name="job_title" value={formData.job_title || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="department_id">{t('employees.form.department_id')}</Label>
                      <Input id="department_id" name="department_id" value={formData.department_id ?? ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.department_id} />
                      <InputError message={errors.department_id} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="manager_id">{t('employees.form.manager_id')}</Label>
                      <Input id="manager_id" name="manager_id" value={formData.manager_id ?? ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.manager_id} />
                      <InputError message={errors.manager_id} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hire_date">{t('employees.form.hire_date')} *</Label>
                      <Input id="hire_date" name="hire_date" type="date" value={formData.hire_date || ''} onChange={handleChange} aria-invalid={!!errors.hire_date} />
                      <InputError message={errors.hire_date} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold">{t('employees.sections.location_info')}</h3>
                  <p className="text-sm text-muted-foreground">{t('employees.sections.location_info_desc')}</p>
                </div>
                <div className="rounded-lg border p-4 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="work_location">{t('employees.form.work_location')}</Label>
                      <Input id="work_location" name="work_location" value={formData.work_location || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">{t('employees.form.address')}</Label>
                      <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="country">{t('employees.form.country')}</Label>
                      <Input id="country" name="country" value={formData.country || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city">{t('employees.form.city')}</Label>
                      <Input id="city" name="city" value={formData.city || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold">{t('employees.sections.financial_info')}</h3>
                  <p className="text-sm text-muted-foreground">{t('employees.sections.financial_info_desc')}</p>
                </div>
                <div className="rounded-lg border p-4 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="salary">{t('employees.form.salary')}</Label>
                      <Input id="salary" name="salary" value={formData.salary ?? ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.salary} placeholder="0.00" />
                      <InputError message={errors.salary} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="currency">{t('employees.form.currency')}</Label>
                      <select id="currency" name="currency" value={formData.currency || 'usd'} onChange={handleChange} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 w-full rounded-md border bg-white text-black dark:bg-neutral-800 dark:text-white px-3 py-1 text-sm outline-none">
                        <option value="usd">USD</option>
                        <option value="eur">EUR</option>
                        <option value="sar">SAR</option>
                        <option value="egp">EGP</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bank_name">{t('employees.form.bank_name')}</Label>
                      <Input id="bank_name" name="bank_name" value={formData.bank_name || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bank_account_number">{t('employees.form.bank_account_number')}</Label>
                      <Input id="bank_account_number" name="bank_account_number" value={formData.bank_account_number || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="iban">{t('employees.form.iban')}</Label>
                      <Input id="iban" name="iban" value={formData.iban || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold">{t('employees.sections.additional_info')}</h3>
                  <p className="text-sm text-muted-foreground">{t('employees.sections.additional_info_desc')}</p>
                </div>
                <div className="rounded-lg border p-4 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="birth_date">{t('employees.form.birth_date')}</Label>
                      <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date || ''} onChange={handleChange} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gender">{t('employees.form.gender')}</Label>
                      <select id="gender" name="gender" value={formData.gender || ''} onChange={handleChange} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 w-full rounded-md border bg-white text-black dark:bg-neutral-800 dark:text-white px-3 py-1 text-sm outline-none">
                        <option value="">{t('employees.form.gender_select')}</option>
                        <option value="male">{t('employees.form.gender_male')}</option>
                        <option value="female">{t('employees.form.gender_female')}</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="marital_status">{t('employees.form.marital_status')}</Label>
                      <Input id="marital_status" name="marital_status" value={formData.marital_status || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nationality">{t('employees.form.nationality')}</Label>
                      <Input id="nationality" name="nationality" value={formData.nationality || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="emergency_contact">{t('employees.form.emergency_contact')}</Label>
                      <Input id="emergency_contact" name="emergency_contact" value={formData.emergency_contact || ''} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.visit('/employees')}>
                  {t('common.back')}
                </Button>
                <Button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  {t('buttons.save', { defaultValue: 'Save' })}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

function DeleteEmployeeConfirm({ onConfirm }: { onConfirm: (password: string, setFieldError: (msg: string) => void) => Promise<void> | void }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        if (!password.trim()) {
          setError(t('common.password'));
          return;
        }
        try {
          setSubmitting(true);
          await onConfirm(password, (msg) => setError(msg));
          // close handled by dialog consumer
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="grid gap-2">
        <label htmlFor="delete_password" className="sr-only">{t('common.password')}</label>
        <input
          id="delete_password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('common.password')}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 w-full rounded-md border bg-white text-black dark:bg-neutral-800 dark:text-white px-3 py-1 text-sm outline-none"
        />
        <InputError message={error} />
      </div>
      <DialogFooter className="gap-2">
        <DialogClose asChild>
          <Button variant="secondary" type="button">{t('common.cancel')}</Button>
        </DialogClose>
        <Button type="submit" variant="destructive" disabled={submitting}>
          {t('employees.details.delete')}
        </Button>
      </DialogFooter>
    </form>
  );
}

function LinkEmployeeDialog({ employeeId }: { employeeId: number }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState<'manager' | 'hr' | 'employee'>('employee');
  const [warning, setWarning] = useState('');
  const [confirmMove, setConfirmMove] = useState(false);

  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const debouncedSearch = React.useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        setIsLoading(true);
        const response = await axios.post('/users/search', { email: query });
        if (response.data?.success) {
          setSearchResults(response.data.users || []);
          setError('');
        } else {
          setSearchResults([]);
          setError(t('company.invite.search_error'));
        }
      } catch (err) {
        setError(t('company.invite.search_error'));
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [t]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    debouncedSearch(q);
  };

  const handleLink = async (force = false) => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      const res = await axios.post(`/employee/link-user/${employeeId}`, { user_id: selectedUser.id, role, force });
      if (res.data?.success) {
        setSuccess(t('employees.link.linked_success'));
        setTimeout(() => setIsOpen(false), 800);
      } else if (res.data?.code === 'ALREADY_LINKED') {
        // Non-blocking warning and wait for explicit checkbox confirmation
        setWarning(t('employees.link.move_confirm'));
      } else {
        const msg = (res.data && res.data.message) ? String(res.data.message) : '';
        setError(msg || t('employees.link.linked_error'));
      }
    } catch (err) {
      setError(t('employees.link.linked_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">{t('employees.link.open_button')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t('employees.link.title')}</DialogTitle>
        <DialogDescription>{t('employees.link.description')}</DialogDescription>

        <div className="space-y-4 mt-3">
          <Input
            placeholder={t('employees.link.search_placeholder')}
            value={searchQuery}
            onChange={handleSearchChange}
          />

          {isLoading ? (
            <div className="text-sm">{t('common.loading')}...</div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-48 overflow-auto border rounded">
              <ul className="divide-y">
                {searchResults.map((u) => (
                  <li key={u.id} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <div className="flex justify-between">
                      <span className="font-medium">{u.name}</span>
                      <span className="text-sm text-muted-foreground">{u.email}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {selectedUser && (
            <div className="text-sm">{t('employees.link.select_user')}: <span className="font-medium">{selectedUser.name}</span></div>
          )}

          {/* Role selection as appearance-style tabs */}
          <div className="space-y-2">
            <label className="block text-sm mb-1">{t('company.table.role')}</label>
            <div className="inline-flex gap-1 rounded-lg bg-secondary p-1">
              {(['employee','hr','manager'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`flex items-center justify-center rounded-md px-3.5 py-1.5 text-sm transition-colors ${
                    role === value
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-foreground hover:bg-primary hover:bg-opacity-20'
                  }`}
                >
                  {t(`company.table.roles.${value}`)}
                </button>
              ))}
            </div>
          </div>

          {warning && <StatusMessage type="warning" message={warning} />}
          {error && <StatusMessage type="error" message={error} />}
          {success && <StatusMessage type="success" message={success} />}

          {warning && (
            <div className="flex items-center gap-2">
              <Checkbox id="confirm-move" checked={confirmMove} onCheckedChange={(v: any) => setConfirmMove(Boolean(v))} />
              <label htmlFor="confirm-move" className="text-sm">{t('employees.link.confirm_checkbox', { defaultValue: 'I confirm moving the link' })}</label>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="secondary">{t('common.cancel')}</Button>
          </DialogClose>
          <Button
            onClick={async () => {
              if (warning) {
                if (!confirmMove || !selectedUser) return;
                try {
                  setIsSubmitting(true);
                  const forced = await axios.post(`/employee/link-user/${employeeId}`, { user_id: selectedUser.id, role, force: true });
                  if (forced.data?.success) {
                    setSuccess(t('employees.link.linked_success'));
                    setError('');
                    setWarning('');
                    setTimeout(() => setIsOpen(false), 800);
                  } else {
                    const msg = (forced.data && forced.data.message) ? String(forced.data.message) : '';
                    setError(msg || t('employees.link.linked_error'));
                  }
                } finally {
                  setIsSubmitting(false);
                }
              } else {
                await handleLink(false);
              }
            }}
            disabled={!selectedUser || isSubmitting || (Boolean(warning) && !confirmMove)}
          >
            {t('employees.link.link_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


