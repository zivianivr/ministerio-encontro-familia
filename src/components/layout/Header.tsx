import { Heart, Users, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-gradient-celestial shadow-divine border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">
                Sistema ECC
              </h1>
              <p className="text-white/80 text-sm">
                Santo Antônio - São Sebastião
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <Users className="h-4 w-4 mr-2" />
              Casais
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <Calendar className="h-4 w-4 mr-2" />
              Encontros
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};