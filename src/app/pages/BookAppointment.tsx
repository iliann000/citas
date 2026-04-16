import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';

export function BookAppointment() {
  const { id } = useParams<{ id: string }>();
  const { people, addAppointment } = useApp();
  const navigate = useNavigate();
  const person = people.find(p => p.id === id);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    notes: '',
  });

  if (!person) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p>Perfil no encontrado</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.location) {
      return;
    }

    addAppointment({
      personId: person.id,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      notes: formData.notes,
    });

    navigate('/appointments');
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl mb-2">Agendar cita</h1>
        <p className="text-muted-foreground">Programa un encuentro con {person.name}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <img 
              src={person.photo} 
              alt={person.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg">{person.name}, {person.age}</h3>
              <p className="text-sm text-muted-foreground">{person.location}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la cita</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                <Calendar className="w-4 h-4 inline mr-2" />
                Fecha
              </Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                <Clock className="w-4 h-4 inline mr-2" />
                Hora
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="w-4 h-4 inline mr-2" />
                Lugar de encuentro
              </Label>
              <Input
                id="location"
                placeholder="Ej: Café Central, Plaza Mayor"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Añade cualquier información adicional..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-muted-foreground">
                Al confirmar la cita, ambos recibirán una notificación automática con los detalles. 
                También recibirás un recordatorio antes de la cita.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Confirmar cita
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
