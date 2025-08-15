'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Filter, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  FilterConditionOperator,
  addTraceCondition,
  removeTraceCondition,
  getOperatorLabel,
  FilterCondition,
} from './trace-filters';
import { TraceFilterLabel } from '@/types/trace-filter';
import { useTraceFilters } from '@/hooks/use-trace-filters';
import { useAIFilters } from '@/hooks/use-ai-filters';

interface TraceFiltersProps {
  currentFilter: FilterCondition[];
  onFilterChange: (filter: FilterCondition[]) => void;
  className?: string;
}

export function TraceFilters({
  currentFilter,
  onFilterChange,
  className,
}: TraceFiltersProps) {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [activeValue, setActiveValue] = useState<string>('');
  const [activeOp, setActiveOp] = useState<FilterConditionOperator>('=');
  const [fieldSearchQuery, setFieldSearchQuery] = useState<string>('');
  const [valueSearchQuery, setValueSearchQuery] = useState<string>('');
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
  const [isValueDropdownOpen, setIsValueDropdownOpen] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState<string>('');
  const [isAiSearchEnabled, setIsAiSearchEnabled] = useState(false);

  const { data: filterLabels, isLoading, error } = useTraceFilters();

  const {
    data: aiFilters,
    isLoading: isAiLoading,
    error: aiError,
  } = useAIFilters({
    query: aiSearchQuery,
    availableFilters: filterLabels || [],
    enabled: isAiSearchEnabled,
  });

  useEffect(() => {
    setFieldSearchQuery('');
    setValueSearchQuery('');
    setActiveValue('');
  }, [activeField]);

  useEffect(() => {
    if (aiFilters?.filters && aiFilters.filters.length > 0) {
      const newFilters = [...currentFilter, ...aiFilters.filters];
      onFilterChange(newFilters);

      setAiSearchQuery('');
      setIsAiSearchEnabled(false);

      console.log('Applied AI generated filters:', aiFilters.filters);
    }
  }, [aiFilters, currentFilter, onFilterChange]);

  const handleAddFilter = () => {
    if (activeField && activeValue) {
      const newFilter = addTraceCondition(
        currentFilter,
        activeField,
        activeValue,
        activeOp
      );
      onFilterChange(newFilter);
      setActiveField(null);
      setActiveValue('');
      setActiveOp('=');
      setFieldSearchQuery('');
      setValueSearchQuery('');
      setIsFieldDropdownOpen(false);
      setIsValueDropdownOpen(false);
    }
  };

  const handleFieldSelect = (field: string) => {
    setActiveField(field);
    setIsFieldDropdownOpen(false);
  };

  const handleValueSelect = (value: string) => {
    setActiveValue(value);
    setValueSearchQuery(value);
    setIsValueDropdownOpen(false);
  };

  const handleFieldInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const filteredFields = filterLabels.filter(label =>
        label.key.toLowerCase().includes(fieldSearchQuery.toLowerCase())
      );
      if (filteredFields.length > 0) {
        handleFieldSelect(filteredFields[0].key);
      }
    }
  };

  const handleValueInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (activeValue.trim()) {
        handleAddFilter();
      }
    }
  };

  const handleAiSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (aiSearchQuery.trim()) {
        setIsAiSearchEnabled(true);
      }
    }
  };

  const handleAiSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiSearchQuery(e.target.value);
    setIsAiSearchEnabled(false); // Reset when user types
  };

  const handleRemoveFilter = (index: number) => {
    const newFilter = removeTraceCondition(currentFilter, index);
    onFilterChange(newFilter);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading filter labels</div>;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* AI Filter Input and Add Filter Button */}
      <div className="flex justify-between items-center w-full gap-4">
        {/* AI Filter Input */}
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Ask AI to filter data"
            className={cn(
              'w-full h-10 text-base pl-10',
              aiError && 'border-red-500 focus:border-red-500'
            )}
            value={aiSearchQuery}
            onChange={handleAiSearchChange}
            onKeyDown={handleAiSearchKeyDown}
            disabled={isAiLoading}
          />
          <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
          {isAiLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
          {aiError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 text-red-500">⚠️</div>
            </div>
          )}
        </div>

        {/* Add filter button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="default" className="h-10 gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Add Filter</h4>

              {/* Field selector */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center min-w-0">
                <DropdownMenu
                  modal={false}
                  open={isFieldDropdownOpen}
                  onOpenChange={setIsFieldDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between min-w-0"
                    >
                      <span className="truncate">
                        {activeField || 'Select field'}
                      </span>
                      <Filter className="h-3.5 w-3.5 ml-2 opacity-70 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="max-h-60 overflow-y-auto w-80"
                    onCloseAutoFocus={e => e.preventDefault()}
                  >
                    <div className="p-2">
                      <Input
                        placeholder="Search fields..."
                        value={fieldSearchQuery}
                        onChange={e => setFieldSearchQuery(e.target.value)}
                        className="h-8"
                        onKeyDown={handleFieldInputKeyDown}
                      />
                    </div>
                    <DropdownMenuSeparator />
                    {filterLabels
                      .filter(label =>
                        label.key
                          .toLowerCase()
                          .includes(fieldSearchQuery.toLowerCase())
                      )
                      .map(label => (
                        <DropdownMenuItem
                          key={label.key}
                          onSelect={() => handleFieldSelect(label.key)}
                        >
                          {label.key}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Operator selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full min-w-0"
                    >
                      <span className="truncate">
                        {getOperatorLabel(activeOp)}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem onSelect={() => setActiveOp('=')}>
                      equals
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setActiveOp('!=')}>
                      not equals
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setActiveOp('=~')}>
                      contains
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setActiveOp('!~')}>
                      not contains
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setActiveOp('=~regex')}>
                      matches regex
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setActiveOp('!~regex')}>
                      not matches regex
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setActiveOp('>')}>
                      greater than
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setActiveOp('<')}>
                      less than
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setActiveOp('>=')}>
                      greater or equal
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setActiveOp('<=')}>
                      less or equal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Value input/selector */}
                {activeField && (
                  <DropdownMenu
                    modal={false}
                    open={isValueDropdownOpen}
                    onOpenChange={setIsValueDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between min-w-0"
                      >
                        <span className="truncate">
                          {activeValue || 'Select value'}
                        </span>
                        <Filter className="h-3.5 w-3.5 ml-2 opacity-70 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="max-h-60 overflow-y-auto w-80"
                      onCloseAutoFocus={e => e.preventDefault()}
                    >
                      <div className="p-2">
                        <Input
                          placeholder="Search or type custom value..."
                          value={valueSearchQuery}
                          onChange={e => {
                            setValueSearchQuery(e.target.value);
                            setActiveValue(e.target.value);
                          }}
                          className="h-8"
                          onKeyDown={handleValueInputKeyDown}
                        />
                      </div>
                      <DropdownMenuSeparator />
                      {filterLabels
                        .find(label => label.key === activeField)
                        ?.values.filter(value =>
                          value
                            .toLowerCase()
                            .includes(valueSearchQuery.toLowerCase())
                        )
                        .map(value => (
                          <DropdownMenuItem
                            key={value}
                            onSelect={() => handleValueSelect(value)}
                            className="break-all"
                          >
                            {value}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Add button */}
              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  onClick={handleAddFilter}
                  disabled={!activeField || !activeValue}
                >
                  Add Filter
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected filters */}
      {currentFilter.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {currentFilter.map((condition, index) => (
            <Badge
              key={`${condition.field}-${index}`}
              variant="outline"
              className="px-2 py-1 gap-1 flex items-center"
            >
              <span className="font-medium">{condition.field}</span>
              <span className="text-xs opacity-70">
                {getOperatorLabel(condition.op)}
              </span>
              <span>{condition.value}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 opacity-70 hover:opacity-100"
                onClick={() => handleRemoveFilter(index)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
