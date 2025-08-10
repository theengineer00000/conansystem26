import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { useTranslation } from 'react-i18next';
import UploadSolidFullIcon from '@/components/icons/UploadSolidFullIcon';
import TrashSolidFullIcon from '@/components/icons/TrashSolidFullIcon';
import ImageSolidFullIcon from '@/components/icons/ImageSolidFullIcon';

interface ImageUploadProps {
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  value?: File | null;
  existingUrl?: string;
  onChange?: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  required?: boolean;
}

export default function ImageUpload({
  id = 'image-upload',
  name = 'image',
  label,
  hint,
  error,
  value,
  existingUrl,
  onChange,
  accept = 'image/*',
  maxSize = 5,
  className,
  required = false,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileSize, setFileSize] = useState<string>('');

  useEffect(() => {
    if (value) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
      setFileSize(formatFileSize(value.size));
    } else if (existingUrl) {
      setPreview(existingUrl);
      setFileSize('');
    } else {
      setPreview(null);
      setFileSize('');
    }
  }, [value, existingUrl]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file: File | null) => {
    if (file && file.size > maxSize * 1024 * 1024) {
      alert(t('upload.file_too_large', { defaultValue: `File size must be less than ${maxSize}MB` }));
      return;
    }
    onChange?.(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    handleFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      {label && (
        <Label htmlFor={id}>
          {label} {required && '*'}
        </Label>
      )}
      
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border-2 border-dashed transition-all',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          error ? 'border-destructive' : '',
          'hover:border-primary/50 hover:bg-muted/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          id={id}
          name={name}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="sr-only"
        />
        
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full text-black hover:bg-gray-100 transition-colors"
                title={t('upload.change_image', { defaultValue: 'Change image' })}
              >
                <UploadSolidFullIcon className="size-5 fill-current" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-white rounded-full text-black hover:bg-gray-100 transition-colors"
                title={t('upload.remove_image', { defaultValue: 'Remove image' })}
              >
                <TrashSolidFullIcon className="size-5 fill-current" />
              </button>
            </div>
            {fileSize && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {fileSize}
              </div>
            )}
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex flex-col items-center justify-center p-8 cursor-pointer"
          >
            <ImageSolidFullIcon className="size-12 mb-3 fill-current text-black dark:text-white" />
            <span className="text-sm font-medium text-foreground">
              {t('upload.click_to_upload', { defaultValue: 'Click to upload' })}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              {t('upload.or_drag_drop', { defaultValue: 'or drag and drop' })}
            </span>
            <span className="text-xs text-muted-foreground mt-2">
              {t('upload.max_size', { defaultValue: `Max ${maxSize}MB` })}
            </span>
          </label>
        )}
      </div>
      
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      
      <InputError message={error} />
    </div>
  );
}
