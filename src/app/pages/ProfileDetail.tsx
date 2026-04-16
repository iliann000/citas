import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { useState } from 'react'; // Importamos useState para el zoom
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  MapPin, Calendar, Heart, MessageCircle, 
  ArrowLeft, Ruler, User, Shield, Activity, 
  Sparkles, Info, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Separator } from '../components/ui/separator';

export function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const { people } = useApp();
  const navigate = useNavigate();
  const person = people.find(p => p.id === id);

  // --- ESTADOS PARA EL ZOOM (LIGHTBOX) ---
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Creamos un array único con todas las fotos (perfil + galería) para el zoom
  const allPhotos = person ? [person.photo, ...(person.gallery || [])].filter(Boolean) : [];

  if (!person) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center bg-white min-h-screen">
        <p className="text-muted-foreground font-medium">Perfil no encontrado</p>
        <Button variant="link" onClick={() => navigate('/')}>Volver al inicio</Button>
      </div>
    );
  }

  // --- FUNCIONES PARA EL ZOOM ---
  const openZoom = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsZoomOpen(true);
  };

  const closeZoom = () => {
    setIsZoomOpen(false);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se cierre el modal
    setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se cierre el modal
    setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white min-h-screen relative">
      
      {/* --- MODAL DE ZOOM (LIGHTBOX) --- */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center backdrop-blur-sm p-4"
          onClick={closeZoom} // Cierra al hacer clic fuera
        >
          {/* Botón Cerrar */}
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2 bg-black/20 rounded-full"
            onClick={closeZoom}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Imagen Grande */}
          <img 
            src={allPhotos[currentPhotoIndex]} 
            alt={`Foto ${currentPhotoIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border-4 border-white/10"
            onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer clic en la foto
          />

          {/* Navegación (Solo si hay más de 1 foto) */}
          {allPhotos.length > 1 && (
            <>
              <button 
                className="absolute left-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                onClick={prevPhoto}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                className="absolute right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                onClick={nextPhoto}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              {/* Contador */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 font-mono text-sm">
                {currentPhotoIndex + 1} / {allPhotos.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* --- DISEÑO NORMAL DEL PERFIL --- */}
      
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6 text-muted-foreground hover:text-foreground font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* COLUMNA IZQUIERDA: FOTOS Y UBICACIÓN */}
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Foto Principal con Click para Zoom (Índice 0) */}
            <img 
              src={person.photo || 'https://via.placeholder.com/400'} 
              alt={person.name}
              className="w-full aspect-square object-cover rounded-2xl shadow-md border border-border cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openZoom(0)}
            />
            
            {/* Galería de Fotos con Click para Zoom (Índices 1+) */}
            {person.gallery && person.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {person.gallery.map((url: string, index: number) => (
                  <img 
                    key={index}
                    src={url}
                    alt={`Galería ${index + 1}`}
                    className="aspect-square object-cover rounded-xl border border-border hover:ring-2 ring-primary/30 transition-all cursor-pointer"
                    onClick={() => openZoom(index + 1)} // El índice es index + 1 porque el 0 es la principal
                  />
                ))}
              </div>
            )}
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Ubicación</p>
              <p className="font-semibold text-sm">{person.location || 'No especificada'}</p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: DATOS PERSONALES */}
        <div className="space-y-6">
          <div className="relative">
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{person.name}</h1>
              <span className="text-2xl text-muted-foreground font-light">{person.age > 0 ? `, ${person.age}` : ''}</span>
            </div>
            <p className="text-sm font-medium text-primary/70">@{person.username || 'usuario'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> Estatura
                </p>
                <p className="font-bold text-sm">{person.estatura || '--'}</p>
             </div>
             <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" /> Complexión
                </p>
                <p className="font-bold text-sm capitalize">{person.complexion || '--'}</p>
             </div>
          </div>

          {/* Biografía */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Info className="w-3 h-3" /> Biografía
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed bg-muted/20 p-4 rounded-xl italic">
              "{person.bio || 'Sin biografía aún.'}"
            </p>
          </div>

          {/* Género e Interés */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Género</p>
                <Badge variant="secondary" className="px-3 py-1 capitalize border border-border shadow-sm">{person.gender || 'No especificado'}</Badge>
             </div>
             <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Me interesa</p>
                <Badge className="px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                   {person.sexual_orientation || 'Ambos'}
                </Badge>
             </div>
          </div>

          <Separator className="my-6" />

          {/* Seguridad & Salud */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Seguridad & Salud
            </h3>
            
            <Card className="border-none bg-emerald-50/50 shadow-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-emerald-950/80">Vacunación COVID-19</span>
                  <Badge className={person.covid_vaccinated ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-600"}>
                    {person.covid_vaccinated ? 'Completada' : 'No especificada'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-emerald-950/80">Status ETS</span>
                  <span className="font-bold text-emerald-800 capitalize">
                    {person.std_status === 'negativo' ? 'Negativo (-)' : person.std_status || 'Reservado'}
                  </span>
                </div>

                {person.last_checkup && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground pt-1 border-t border-emerald-100 mt-2">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    Último Test: {new Date(person.last_checkup).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-6">
            <Button 
              className="flex-1 h-12 shadow-sm rounded-xl font-bold bg-primary hover:bg-primary/90"
              onClick={() => navigate(`/chat/${person.id}`)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar mensaje
            </Button>
            <Button 
              variant="outline"
              className="h-12 w-12 rounded-xl border-border hover:bg-rose-50 hover:border-rose-200"
            >
              <Heart className="w-5 h-5 text-rose-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}