import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface TagButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function TagButton({ children, icon, active, onClick }: TagButtonProps) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-2 transition-all duration-300",
        active && "bg-primary/20 border-primary/60 text-primary"
      )}
    >
      {icon}
      {children}
    </Button>
  );
}
