export function sortBySpecialId<T>(items: T[], getSpecialId: (item: T) => number | undefined): T[] {
  return [...items].sort((a, b) => (getSpecialId(a) ?? Infinity) - (getSpecialId(b) ?? Infinity));
}
