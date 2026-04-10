export function digitalCategoryToSlug(category: string | null | undefined): string | null {
  if (!category) return null;
  const trimmed = category.trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase().replace(/\s+/g, "-");
}
