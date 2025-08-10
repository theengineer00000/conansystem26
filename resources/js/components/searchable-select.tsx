import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Option {
  id: string | number;
  label: string;
}

interface SearchableSelectProps {
  value: string | number | null;
  onChange: (value: string | number) => void;
  onSearch: (query: string) => Promise<Option[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  initialOptions?: Option[];
  searchPlaceholder?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  onSearch,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  error,
  initialOptions = [],
  searchPlaceholder = 'Search...'
}: SearchableSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Load initial options when first opened
  useEffect(() => {
    if (isOpen && options.length === 0 && !searchQuery) {
      loadOptions('');
    }
  }, [isOpen]);

  // Update selected label when value changes
  useEffect(() => {
    if (value && initialOptions.length > 0) {
      const selected = initialOptions.find(opt => String(opt.id) === String(value));
      if (selected) {
        setSelectedLabel(selected.label);
      }
    }
  }, [value, initialOptions]);

  const loadOptions = async (query: string) => {
    try {
      setLoading(true);
      const results = await onSearch(query);
      setOptions(results);
      
      // Update selected label if current value is in results
      if (value) {
        const selected = results.find(opt => String(opt.id) === String(value));
        if (selected) {
          setSelectedLabel(selected.label);
        }
      }
    } catch (error) {
      console.error('Error loading options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    if (isOpen && searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        loadOptions(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else if (isOpen && searchQuery.length === 0) {
      loadOptions('');
    }
  }, [searchQuery, isOpen]);

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setSelectedLabel(option.label);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white dark:bg-neutral-800 
          border rounded-md flex items-center justify-between
          text-sm transition-colors duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-neutral-500'}
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-neutral-600'}
          ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-50 border-blue-500' : ''}
        `}
      >
        <span className={`block truncate ${!selectedLabel && !value ? 'text-gray-400' : ''}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md shadow-lg">
          <div className="p-2 border-b border-gray-200 dark:border-neutral-700">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded-md 
                       bg-white dark:bg-neutral-700 text-black dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>

          <div className="max-h-60 overflow-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {t('common.loading')}...
              </div>
            ) : options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {searchQuery ? t('common.no_results') : t('common.no_options')}
              </div>
            ) : (
              <ul className="py-1">
                {options.map((option) => (
                  <li
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-4 py-2 text-sm cursor-pointer
                      ${String(option.id) === String(value) 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-neutral-700'}
                    `}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
