import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import StatusMessage, { type StatusMessageType } from '@/components/status-message';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/loading-spinner';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
  { title: t('employees.employees_big_title'), href: '/employees' },
  { title: t('employees.create.button'), href: '/employees/create' },
];

export default function EmployeeCreate() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const breadcrumbs = getBreadcrumbs(t);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: StatusMessageType; text: string } | null>(null);

  const [formData, setFormData] = useState({
    // Basic Identity
    full_name: '',
    email: '',
    phone: '',
    national_id: '',
    // Employment
    job_title: '',
    department_id: '',
    manager_id: '',
    hire_date: '',
    // Location
    work_location: '',
    address: '',
    country: '',
    city: '',
    // Financial
    salary: '',
    currency: 'usd',
    bank_name: '',
    bank_account_number: '',
    iban: '',
    // Additional
    birth_date: '',
    gender: '',
    marital_status: '',
    nationality: '',
    emergency_contact: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) newErrors.full_name = t('validation.required', { defaultValue: 'Required' });
    if (!formData.phone.trim()) newErrors.phone = t('validation.required', { defaultValue: 'Required' });
    if (!formData.national_id.trim()) newErrors.national_id = t('validation.required', { defaultValue: 'Required' });
    if (!formData.hire_date.trim()) newErrors.hire_date = t('validation.required', { defaultValue: 'Required' });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.email', { defaultValue: 'Invalid email' });
    }

    if (formData.salary && isNaN(Number(formData.salary))) {
      newErrors.salary = t('validation.numeric', { defaultValue: 'Must be a number' });
    }

    if (formData.department_id && isNaN(Number(formData.department_id))) {
      newErrors.department_id = t('validation.numeric', { defaultValue: 'Must be a number' });
    }
    if (formData.manager_id && isNaN(Number(formData.manager_id))) {
      newErrors.manager_id = t('validation.numeric', { defaultValue: 'Must be a number' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload: Record<string, any> = {
        ...formData,
        salary: formData.salary ? Number(formData.salary) : undefined,
        department_id: formData.department_id ? Number(formData.department_id) : undefined,
        manager_id: formData.manager_id ? Number(formData.manager_id) : undefined,
      };

      const response = await axios.post('/employee/create', payload);
      if (response.data?.success) {
        setMessage({ type: 'success', text: t('employees.create.success') });
        setTimeout(() => router.visit('/employees?success=1'), 800);
      } else if (response.data?.errors) {
        // Server-side validation errors
        const serverErrors = response.data.errors as Record<string, string[]>;
        const flat: Record<string, string> = {};
        Object.entries(serverErrors).forEach(([key, arr]) => {
          if (Array.isArray(arr) && arr.length > 0) flat[key] = arr[0];
        });
        setErrors(flat);
        setMessage({ type: 'error', text: t('employees.create.error') });
      } else {
        setMessage({ type: 'error', text: t('employees.create.error') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('employees.create.error', { defaultValue: 'Failed to create employee' }) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('employees.create.button')} />
      <div className="space-y-8 p-4 md:p-6 max-w-[1500px] w-full mx-auto">
        {/* CSRF token is already configured globally for axios via meta tag in app.tsx */}
        <HeadingSmall
          title={t('employees.create.button')}
          description={t('employees.create.description')}
        />

        {message && (
          <StatusMessage type={message.type} message={message.text} />
        )}

        <Card className="p-6">
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
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.full_name} />
                <InputError message={errors.full_name} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.full_name_hint')}</p>
              </div>
                  <div className="grid gap-2">
                <Label htmlFor="email">{t('employees.form.email')}</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.email} />
                <InputError message={errors.email} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.email_hint')}</p>
              </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">{t('employees.form.phone')} *</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.phone} />
                <InputError message={errors.phone} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.phone_hint')}</p>
              </div>
                  <div className="grid gap-2">
                    <Label htmlFor="national_id">{t('employees.form.national_id')} *</Label>
                <Input id="national_id" name="national_id" value={formData.national_id} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.national_id} />
                <InputError message={errors.national_id} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.national_id_hint')}</p>
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
                    <Input id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.job_title_hint')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department_id">{t('employees.form.department_id')}</Label>
                    <Input id="department_id" name="department_id" value={formData.department_id} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.department_id} />
                    <InputError message={errors.department_id} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.department_id_hint')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="manager_id">{t('employees.form.manager_id')}</Label>
                    <select
                      id="manager_id"
                      name="manager_id"
                      value={formData.manager_id}
                      onChange={handleChange}
                      className="border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 w-full rounded-md border bg-white text-black dark:bg-neutral-800 dark:text-white px-3 py-1 text-sm outline-none"
                    >
                      <option value="">{t('employees.form.manager_id_placeholder')}</option>
                    </select>
                    <InputError message={errors.manager_id} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.manager_id_placeholder')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hire_date">{t('employees.form.hire_date')} *</Label>
                    <Input id="hire_date" name="hire_date" type="date" value={formData.hire_date} onChange={handleChange} aria-invalid={!!errors.hire_date} />
                    <InputError message={errors.hire_date} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.hire_date_hint')}</p>
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
                    <Input id="work_location" name="work_location" value={formData.work_location} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.work_location_hint')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">{t('employees.form.address')}</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.address_hint')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">{t('employees.form.country')}</Label>
                    <Input id="country" name="country" value={formData.country} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.country_hint')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">{t('employees.form.city')}</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.city_hint')}</p>
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
                    <Input id="salary" name="salary" value={formData.salary} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} aria-invalid={!!errors.salary} placeholder="0.00" />
                    <InputError message={errors.salary} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.salary_hint')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">{t('employees.form.currency')}</Label>
                <select id="currency" name="currency" value={formData.currency} onChange={handleChange} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 w-full rounded-md border bg-white text-black dark:bg-neutral-800 dark:text-white px-3 py-1 text-sm outline-none">
                      <option value="usd">USD</option>
                      <option value="eur">EUR</option>
                      <option value="sar">SAR</option>
                      <option value="egp">EGP</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bank_name">{t('employees.form.bank_name')}</Label>
                    <Input id="bank_name" name="bank_name" value={formData.bank_name} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.bank_name_hint')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bank_account_number">{t('employees.form.bank_account_number')}</Label>
                    <Input id="bank_account_number" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.bank_account_number_hint')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="iban">{t('employees.form.iban')}</Label>
                    <Input id="iban" name="iban" value={formData.iban} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.iban_hint')}</p>
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
                    <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.birth_date_hint')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gender">{t('employees.form.gender')}</Label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 w-full rounded-md border bg-white text-black dark:bg-neutral-800 dark:text-white px-3 py-1 text-sm outline-none">
                      <option value="">{t('employees.form.gender_select')}</option>
                      <option value="male">{t('employees.form.gender_male')}</option>
                      <option value="female">{t('employees.form.gender_female')}</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="marital_status">{t('employees.form.marital_status')}</Label>
                    <Input id="marital_status" name="marital_status" value={formData.marital_status} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.marital_status_hint')}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nationality">{t('employees.form.nationality')}</Label>
                    <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.nationality_hint')}</p>
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="emergency_contact">{t('employees.form.emergency_contact')}</Label>
                    <Input id="emergency_contact" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} dir={isRTL ? 'rtl' : 'ltr'} />
                    <p className="text-xs text-muted-foreground">{t('employees.form.emergency_contact_hint')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.visit('/employees')}>
                {t('common.back')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                {isSubmitting ? (
                  <span className="flex items-center">
                    <LoadingSpinner size={16} />
                    <span className="ms-2">{t('loading.please_wait', { defaultValue: 'Please wait...' })}</span>
                  </span>
                ) : (
                  t('employees.form.submit')
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}


