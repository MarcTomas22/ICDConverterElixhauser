import { Badge } from "@/components/ui/badge";

interface ClassificationBadgeProps {
  category: string | null;
}

export function ClassificationBadge({ category }: ClassificationBadgeProps) {
  if (!category) {
    return (
      <Badge
        variant="outline"
        className="bg-chart-3/10 text-chart-3 border-chart-3/30"
        data-testid={`badge-classification-none`}
      >
        No clasificado
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-chart-2/10 text-chart-2 border-chart-2/30"
      data-testid={`badge-classification-${category.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {category}
    </Badge>
  );
}
