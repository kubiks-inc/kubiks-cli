'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '../../lib/utils';

interface TraceFiltersProps {
  onSearchChange: (query: string) => void;
  className?: string;
}

export function TraceFilters({
  onSearchChange,
  className,
}: TraceFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onSearchChange(searchQuery);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Input
          placeholder="Search traces..."
          className="w-full h-10 text-base pl-4"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
      </div>
    </div>
  );
}
