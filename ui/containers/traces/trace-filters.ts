// Trace filter types and utilities

export type FilterConditionOperator =
  | '='
  | '!='
  | '=~'
  | '!~'
  | '=~regex'
  | '!~regex'
  | '>'
  | '<'
  | '>='
  | '<=';

export type FilterOperator = 'and' | 'or';

// FilterCondition represents a single filter condition
export interface FilterCondition {
  field: string;
  op: FilterConditionOperator;
  value: string;
}

// Helper function to add a condition to a filter
export const addTraceCondition = (
  filter: FilterCondition[],
  field: string,
  value: string,
  op: FilterConditionOperator = '='
): FilterCondition[] => {
  const newFilter = [...filter];
  newFilter.push({ field, op, value });
  return newFilter;
};

// Helper function to remove a condition from a filter
export const removeTraceCondition = (
  filter: FilterCondition[],
  index: number
): FilterCondition[] => {
  const newFilter = [...filter];
  newFilter.splice(index, 1);
  return newFilter;
};

// Helper function to get operator label
export const getOperatorLabel = (op: FilterConditionOperator): string => {
  switch (op) {
    case '=':
      return 'equals';
    case '!=':
      return 'not equals';
    case '=~':
      return 'contains';
    case '!~':
      return 'not contains';
    case '=~regex':
      return 'matches regex';
    case '!~regex':
      return 'not matches regex';
    case '>':
      return 'greater than';
    case '<':
      return 'less than';
    case '>=':
      return 'greater or equal';
    case '<=':
      return 'less or equal';
    default:
      return op;
  }
};
