import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import StatusMessage, { StatusMessageType } from '@/components/status-message';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/loading-spinner';
import { type BreadcrumbItem } from '@/types';

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
  {
    title: t('company.company_big_title'),
    href: '/settings/company',
  },
  {
    title: t('company.create.title'),
    href: '/settings/company/create',
  },
];

export default function CreateCompany() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const breadcrumbs = getBreadcrumbs(t);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    description: ''
  });
  const [message, setMessage] = useState<{ type: StatusMessageType; text: string } | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validate = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    if (!formData.name.trim()) {
      newErrors.name = `${t('company.create.form.name')} ${t('validation.required')}`;
      isValid = false;
    } else if (formData.name.length > 255) {
      newErrors.name = t('validation.maxLength', { length: 255 });
      isValid = false;
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = t('validation.maxLength', { length: 1000 });
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/company/create', formData);
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: t('company.create.success')
        });
        
        // Redirect back to company list after a short delay
        setTimeout(() => {
          router.visit('/settings/company');
        }, 1000);
      } else {
        setMessage({
          type: 'error',
          text: t('company.create.error')
        });
      }
    } catch (error) {
      console.error('Error creating company:', error);
      setMessage({
        type: 'error',
        text: t('company.create.error')
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('company.create.title')} />
      
      <SettingsLayout>
        <div className="space-y-8">
          <div className="space-y-6">
            <HeadingSmall 
              title={t('company.create.title')}
              description={t('company.create.description')}
            />
            
            {message && (
              <StatusMessage 
                type={message.type} 
                message={message.text} 
              />
            )}
            
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="block mb-1">{t('company.create.form.name')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('company.create.form.name_placeholder')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="block mb-1">{t('company.create.form.description')}</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t('company.create.form.description_placeholder')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={() => router.visit('/settings/company')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300"
                  >
                    {t('common.back')}
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <LoadingSpinner size={16} />
                        <span className="ms-2">{t('loading.please_wait')}</span>
                      </span>
                    ) : (
                      t('company.create.form.submit')
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}