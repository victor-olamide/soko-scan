export const CATEGORY_ICONS: Record<string, string> = {
  "Food & Drinks": "🍽️",
  "Clothing": "👗",
  "Electronics": "📱",
  "Services": "🔧",
  "Groceries": "🛒",
  "Other": "🏪",
};

export function categoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? "🏪";
}
