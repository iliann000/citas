import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Bell, BellOff, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';

export function Notifications() {
  const { notifications, markNotificationAsRead, appointments } = useApp();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notificationId: string, appointmentId?: string, chatId?: string) => {
    markNotificationAsRead(notificationId);
    
    if (chatId) {
      navigate(`/chat/${chatId}`);
    } else if (appointmentId) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        navigate('/appointments');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_created':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'appointment_reminder':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'appointment_confirmed':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Notificaciones</h1>
        <p className="text-muted-foreground">
          {unreadCount > 0 
            ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
            : 'Todas las notificaciones están al día'
          }
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <BellOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">No tienes notificaciones</h3>
          <p className="text-muted-foreground">
            Te avisaremos cuando tengas citas o recordatorios
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                !notification.read ? 'border-l-4 border-l-primary' : ''
              }`}
              onClick={() => handleNotificationClick(notification.id, notification.appointmentId, notification.chatId)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={notification.read ? 'text-muted-foreground' : ''}>
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <Badge variant="default" className="shrink-0">Nuevo</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}