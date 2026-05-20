"use client";

interface Props {
  icon?: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon = "📭", title, description }: Props) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
      <p className="text-3xl mb-2">{icon}</p>
      <p className="font-semibold text-gray-700 text-sm">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
  );
}
