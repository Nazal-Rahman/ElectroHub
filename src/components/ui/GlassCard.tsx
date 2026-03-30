import { cn } from "./cn";

export default function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("glass rounded-2xl", className)}>
      {children}
    </div>
  );
}

