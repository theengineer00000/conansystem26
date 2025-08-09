import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
}

// Type shim for lodash/debounce if @types/lodash is not installed
declare module 'lodash/debounce' {
    export default function debounce<T extends (...args: any[]) => any>(
        func: T,
        wait?: number,
        options?: { leading?: boolean; maxWait?: number; trailing?: boolean }
    ): T;
}
