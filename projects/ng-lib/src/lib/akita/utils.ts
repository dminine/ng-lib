import { DnlFilterComparison, DnlBaseEntity, DnlField } from './types';


export function convertStringComparisonToCond(
  a: any,
  comparison: DnlFilterComparison,
  b: any
): boolean {
  if (comparison === '>') {
    return a > b;
  }

  if (comparison === '>=') {
    return a >= b;
  }

  if (comparison === '==') {
    return a === b;
  }

  if (comparison === '<=') {
    return a <= b;
  }

  if (comparison === '<') {
    return a < b;
  }

  if (comparison === '!=') {
    return a !== b;
  }

  if ((Array.isArray(a) || typeof a === 'string') && (comparison === 'array-contains' || comparison === 'text')) {
    return a.indexOf(b) > -1;
  }

  return false;
}

export function getNestedFieldValue<E extends DnlBaseEntity>(entity: E, fieldString: DnlField<E>) {
  const fieldArray = fieldString.split('.');

  let value = entity;
  for (const field of fieldArray) {
    if (value === null || value === undefined) {
      return null;
    }
    value = value[field];
  }

  return value;
}
