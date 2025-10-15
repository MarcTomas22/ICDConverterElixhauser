import { Badge } from "@/components/ui/badge";

interface ClassificationBadgeProps {
  category: string | null;
  onClick?: (category: string) => void;
}

export function ClassificationBadge({ category, onClick }: ClassificationBadgeProps) {
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

  const handleClick = () => {
    if (onClick) {
      onClick(category);
    }
  };

  return (
    <Badge
      variant="outline"
      className={`bg-chart-2/10 text-chart-2 border-chart-2/30 ${onClick ? 'cursor-pointer hover-elevate active-elevate-2' : ''}`}
      data-testid={`badge-classification-${category.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={handleClick}
    >
      {category}
    </Badge>
  );
}
