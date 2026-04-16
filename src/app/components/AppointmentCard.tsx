import { Calendar, Clock, MapPin, User, X } from 'lucide-react';
import { Appointment } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { people, cancelAppointment } = useApp();
  const navigate = useNavigate();
  const person = people.find(p => p.id === appointment.personId);

  if (!person) return null;

  const getStatusBadge = (status: Appointment['status']) => {
    const variants = {
      pending: 'secondary' as const,
      confirmed: 'default' as const,
      completed: 'outline' as const,
      cancelled: 'destructive' as const,
    };

    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={person.photo} 
              alt={person.name}
              className="w-12 h-12 rounded-full object-cover cursor-pointer"
              onClick={() => navigate(`/profile/${person.id}`)}
            />
            <div>
              <CardTitle className="text-lg">{person.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{person.age} años</p>
            </div>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{appointment.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{appointment.location}</span>
        </div>
        {appointment.notes && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <p className="italic">"{appointment.notes}"</p>
          </div>
        )}
        {appointment.status === 'confirmed' && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            onClick={() => cancelAppointment(appointment.id)}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar cita
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
