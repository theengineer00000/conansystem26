import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

type PageItem = number | 'DOTS';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  siblingCount?: number;
  boundaryCount?: number;
  prevLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  alwaysCompact?: boolean;
  className?: string;
}

function createRange(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}

function usePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number,
  alwaysCompact: boolean,
): PageItem[] {
  return useMemo(() => {
    const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2; // page numbers shown + first/last
    const totalBlocks = totalNumbers + 2; // including two DOTS

    if (!alwaysCompact && totalPages <= totalBlocks) {
      return createRange(1, totalPages);
    }

    const startPage = Math.max(
      1 + boundaryCount,
      Math.min(
        currentPage - siblingCount,
        totalPages - boundaryCount - (siblingCount * 2 + 1),
      ),
    );
    const endPage = Math.min(
      totalPages - boundaryCount,
      Math.max(
        currentPage + siblingCount,
        1 + boundaryCount + (siblingCount * 2 + 1),
      ),
    );

    const pages: PageItem[] = [];

    // Left boundary
    pages.push(...createRange(1, boundaryCount));

    // Left DOTS
    if (startPage > boundaryCount + 1) {
      pages.push('DOTS');
    }

    // Middle range
    pages.push(...createRange(startPage, endPage));

    // Right DOTS
    if (endPage < totalPages - boundaryCount) {
      pages.push('DOTS');
    }

    // Right boundary
    pages.push(...createRange(totalPages - boundaryCount + 1, totalPages));

    return pages;
  }, [currentPage, totalPages, siblingCount, boundaryCount, alwaysCompact]);
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  siblingCount = 1,
  boundaryCount = 1,
  prevLabel = 'Prev',
  nextLabel = 'Next',
  alwaysCompact = false,
  className,
}: PaginationProps) {
  const isRtl = typeof document !== 'undefined' && document?.documentElement?.dir === 'rtl';
  const pages = usePaginationRange(currentPage, totalPages, siblingCount, boundaryCount, alwaysCompact);

  const goTo = (page: number) => {
    if (isLoading) return;
    const safePage = Math.min(Math.max(1, page), totalPages || 1);
    if (safePage !== currentPage) onPageChange(safePage);
  };

  const canPrev = currentPage > 1 && !isLoading;
  const canNext = currentPage < totalPages && !isLoading;

  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="pagination" className={cn('flex items-center justify-between gap-2', className)}>
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={!canPrev}
        className={cn('inline-flex items-center gap-1 px-3 py-1.5 rounded-md border bg-white dark:bg-neutral-900 disabled:opacity-50')}
      >
        <span className="text-sm">{prevLabel}</span>
      </button>

      <ul className={cn('flex items-center gap-1', isRtl && 'flex-row-reverse')}>
        {pages.map((item, idx) => {
          if (item === 'DOTS') {
            return (
              <li key={`dots-${idx}`} className="px-2 select-none text-neutral-500">…</li>
            );
          }
          const isActive = item === currentPage;
          return (
            <li key={item}>
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => goTo(item)}
                className={cn(
                  'w-8 h-8 rounded-md border text-sm transition-colors flex items-center justify-center',
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                )}
              >
                {item}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={!canNext}
        className={cn('inline-flex items-center gap-1 px-3 py-1.5 rounded-md border bg-white dark:bg-neutral-900 disabled:opacity-50')}
      >
        <span className="text-sm">{nextLabel}</span>
      </button>
    </nav>
  );
}


