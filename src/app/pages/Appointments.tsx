import { useApp } from '../context/AppContext';
import { AppointmentCard } from '../components/AppointmentCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar } from 'lucide-react';

export function Appointments() {
  const { appointments } = useApp();

  const upcomingAppointments = appointments.filter(
    app => app.status === 'confirmed' || app.status === 'pending'
  );
  
  const pastAppointments = appointments.filter(
    app => app.status === 'completed' || app.status === 'cancelled'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Mis citas</h1>
        <p className="text-muted-foreground">Gestiona tus encuentros programados</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming">
            Próximas ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Historial ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg mb-2">No tienes citas próximas</h3>
              <p className="text-muted-foreground">
                Explora perfiles y agenda tu primera cita
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastAppointments.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg mb-2">Sin historial</h3>
              <p className="text-muted-foreground">
                Tus citas pasadas aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
