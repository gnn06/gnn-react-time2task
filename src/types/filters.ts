export type FilterValue = string | number | boolean;

export type FilterType = 'property' | 'slotexpr';

export type SlotExprPredicate = (task: any) => boolean;

export type GenericFilterSet = {
  [key: string]: FilterValue[] | SlotExprPredicate;
};

export interface FilterConfig {
  type: FilterType;
  key: string;
  label: string;
  options: FilterValue[];
  predicate?: SlotExprPredicate;
  valueLabels?: {
    [key: string]: string;
  };
}

