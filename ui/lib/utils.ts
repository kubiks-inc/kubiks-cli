import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Filter query parameter utilities
export const serializeFilters = (
  filters: Array<{ field: string; op: string; value: string }>
): string => {
  if (!filters || filters.length === 0) return '';

  return filters
    .map(
      filter =>
        `${encodeURIComponent(filter.field)}:${encodeURIComponent(filter.op)}:${encodeURIComponent(filter.value)}`
    )
    .join(',');
};

export const deserializeFilters = (
  filterString: string
): Array<{ field: string; op: string; value: string }> => {
  if (!filterString) return [];

  try {
    return filterString
      .split(',')
      .map(filter => {
        const [field, op, value] = filter.split(':').map(decodeURIComponent);
        return { field, op, value };
      })
      .filter(filter => filter.field && filter.op && filter.value);
  } catch (error) {
    console.error('Error deserializing filters:', error);
    return [];
  }
};
