import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, X, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectOption {
  id: number | string;
  label: string;
}

interface SearchableSelectProps {
  value?: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  onSearch: (query: string) => Promise<SearchableSelectOption[]>;
  initialOptions?: SearchableSelectOption[];
  loadingText?: string;
  noResultsText?: string;
  selectedText?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  clearable?: boolean;
  defaultSearchQuery?: string;
}

export default function SearchableSelect({
  value,
  onValueChange,
  placeholder = 'اختر...',
  searchPlaceholder = 'ابحث...',
  onSearch,
  initialOptions = [],
  loadingText = 'جاري التحميل...',
  noResultsText = 'لا توجد نتائج',
  selectedText = 'محدد:',
  className,
  disabled = false,
  error,
  clearable = true,
  defaultSearchQuery = ''
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery);
  const [options, setOptions] = useState<SearchableSelectOption[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SearchableSelectOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  // Load initial options on mount
  useEffect(() => {
    if (!value && !searchQuery) {
      handleSearch('');
    }
  }, []);

  // Handle value prop changes
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find(opt => String(opt.id) === String(value));
      if (option) {
        setSelectedOption(option);
      }
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value, options]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleSearch = useCallback(async (query: string) => {
    clearTimeout(debounceTimeout.current);
    
    debounceTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await onSearch(query);
        setOptions(results);
        
        // Update selected option if current value is in results
        if (value) {
          const option = results.find(opt => String(opt.id) === String(value));
          if (option) {
            setSelectedOption(option);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [onSearch, value]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleSelect = (option: SearchableSelectOption) => {
    setSelectedOption(option);
    onValueChange(option.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(null);
    onValueChange('');
    setSearchQuery('');
    handleSearch('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && !searchQuery) {
        handleSearch('');
      }
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Main Select Button */}
      <div
        onClick={handleToggle}
        className={cn(
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "h-9 w-full rounded-md border bg-white text-black dark:bg-neutral-800 dark:text-white",
          "px-3 py-1 text-sm outline-none cursor-pointer flex items-center justify-between",
          "hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors",
          disabled && "opacity-50 cursor-not-allowed hover:bg-white dark:hover:bg-neutral-800",
          error && "border-red-500"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-gray-500")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {clearable && selectedOption && !disabled && (
            <X 
              className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" 
              onClick={handleClear}
            />
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-500 transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800",
          "border border-gray-200 dark:border-gray-700 rounded-md shadow-lg",
          "max-h-[300px] overflow-hidden"
        )}>
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder={searchPlaceholder}
                className={cn(
                  "w-full pl-8 pr-3 py-1.5 text-sm",
                  "border border-gray-300 dark:border-gray-600 rounded",
                  "bg-white dark:bg-neutral-700 text-black dark:text-white",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
              />
              {isLoading && (
                <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[220px] overflow-y-auto">
            {isLoading && options.length === 0 ? (
              <div className="px-3 py-4 text-sm text-center text-gray-500">
                {loadingText}
              </div>
            ) : options.length > 0 ? (
              <ul className="py-1">
                {options.map((option) => (
                  <li
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer transition-colors",
                      "hover:bg-gray-100 dark:hover:bg-neutral-700",
                      String(selectedOption?.id) === String(option.id) && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    )}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-4 text-sm text-center text-gray-500">
                {noResultsText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
