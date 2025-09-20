import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: string;
  description?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  gradient = "bg-gradient-celestial",
  description 
}: StatsCardProps) => {
  return (
    <Card className="overflow-hidden shadow-gentle hover:shadow-divine transition-all duration-300">
      <CardContent className="p-0">
        <div className={`${gradient} p-4 text-white`}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        </div>
        {description && (
          <div className="p-4">
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};