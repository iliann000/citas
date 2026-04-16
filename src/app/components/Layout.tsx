import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Home, Calendar, Bell, MessageCircle, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from './ui/badge';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, appointments, chats } = useApp();
  
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const upcomingAppointments = appointments.filter(
    app => app.status === 'confirmed' || app.status === 'pending'
  ).length;
  const unreadMessages = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/messages', icon: MessageCircle, label: 'Mensajes', badge: unreadMessages },
    { to: '/notifications', icon: Bell, label: 'Notificaciones', badge: unreadNotifications },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      toast.success('Sesión cerrada correctamente');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground rounded-full p-2">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xl font-semibold">Match</span>
            </Link>
            
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors relative ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge 
                          variant={isActive ? 'secondary' : 'default'} 
                          className="ml-1 px-2 py-0 h-5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden md:block w-px h-6 bg-zinc-200" />
              <Link
                  to="/profile/edit"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                    location.pathname === '/profile/edit' 
                      ? 'bg-secondary text-secondary-foreground shadow-sm' 
                      : 'hover:bg-muted text-zinc-600'
                  }`}
                >
                  <div className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium hidden lg:inline">Mi Perfil</span>
              </Link>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors px-3 py-2"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-t bg-background fixed bottom-0 left-0 right-0 z-50">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-1 relative"
              >
                <div className={`relative ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  <item.icon className="w-5 h-5" />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 px-1.5 py-0 h-4 text-[10px] min-w-[16px] flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className={`text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Spacer for mobile nav */}
      <div className="md:hidden h-20" />
    </div>
  );
}