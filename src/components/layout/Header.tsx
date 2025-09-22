import { Heart, Menu, Settings, LogOut, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-gradient-celestial shadow-divine border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
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
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Users className="h-4 w-4 mr-2" />
                Casais
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Calendar className="h-4 w-4 mr-2" />
                Encontros
              </Button>
            </nav>

            {/* Menu do Usuário */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full text-white hover:bg-white/20">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-white/20 text-white border-white/30">
                        {getUserInitials(user.email || '')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'Usuário'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/auth')} 
                variant="ghost" 
                className="text-white hover:bg-white/20 border border-white/30"
              >
                Entrar
              </Button>
            )}

            {/* Menu Mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  <Button variant="ghost" onClick={() => navigate('/')} className="justify-start">
                    Início
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Casais
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Encontros
                  </Button>
                  {user && (
                    <>
                      <hr className="my-4" />
                      <Button variant="ghost" onClick={() => navigate('/configuracoes')} className="justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Button>
                      <Button variant="ghost" onClick={handleSignOut} className="justify-start">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};