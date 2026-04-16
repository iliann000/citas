import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { 
  MapPin, Shield, User, Heart, X, 
  Loader2, AlignLeft, Calendar, AtSign,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const OnboardingModal = ({ isOpen, onClose, userId }: OnboardingProps) => {
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    birthday: '',
    gender: '',
    sexual_orientation: '',
    covid_vaccinated: false,
    std_status: 'prefiero_no_decir',
    lat: null as number | null,
    lng: null as number | null
  });

  // --- AUTO-GPS AL ABRIR ---
  useEffect(() => {
    if (isOpen && !formData.lat) {
      setGpsStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
          setGpsStatus('success');
          toast.success("Ubicación detectada");
        },
        () => {
          setGpsStatus('error');
          toast.error("No pudimos detectar tu GPS");
        }
      );
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!formData.full_name || !formData.username || !formData.birthday) {
      toast.error("Por favor llena los campos básicos (Nombre, Usuario y Edad)");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          updated_at: new Date(),
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success("¡Todo listo! Bienvenido.");
      onClose(); // Cerramos el modal
      window.location.reload(); // Recargamos para limpiar el estado del Home
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden"
      >
        <div className="relative p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 mb-4">
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-3xl font-bold text-white">¡Crea tu perfil!</h2>
            <p className="text-zinc-400 mt-2">Personaliza cómo te ven los demás</p>
          </div>

          <div className="space-y-6">
            
            {/* Sección: Identidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1 flex items-center gap-2">
                  <User className="w-3 h-3" /> NOMBRE REAL
                </label>
                <input 
                  placeholder="Ej: María García" 
                  className="w-full bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1 flex items-center gap-2">
                  <AtSign className="w-3 h-3" /> USERNAME
                </label>
                <input 
                  placeholder="mariga_99" 
                  className="w-full bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            {/* Sección: Bio y Edad */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 ml-1 flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> BIOGRAFÍA
              </label>
              <textarea 
                placeholder="Cuéntanos tus hobbies, qué buscas..." 
                className="w-full bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none transition-all"
                onChange={e => setFormData({...formData, bio: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> NACIMIENTO
                </label>
                <input 
                  type="date"
                  className="w-full bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500 [color-scheme:dark]"
                  onChange={e => setFormData({...formData, birthday: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1">GÉNERO</label>
                <select 
                  className="w-full bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500"
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="">Elegir...</option>
                  <option value="mujer">Mujer</option>
                  <option value="hombre">Hombre</option>
                  <option value="no_binario">No binario</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1 flex items-center gap-2">
                  <Heart className="w-3 h-3" /> BUSCO
                </label>
                <select 
                  className="w-full bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500"
                  onChange={e => setFormData({...formData, sexual_orientation: e.target.value})}
                >
                  <option value="">Elegir...</option>
                  <option value="hombres">Hombres</option>
                  <option value="mujeres">Mujeres</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
            </div>

            {/* Sección Salud (Card amigable) */}
            <div className="p-6 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-[2rem] border border-zinc-700/50 space-y-4">
              <p className="text-xs font-black text-purple-400 flex items-center gap-2 tracking-[0.2em]">
                <Shield className="w-4 h-4" /> COMPROMISO DE SALUD
              </p>
              
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors border border-zinc-800">
                  <span className="text-sm text-zinc-300">Vacunado contra COVID-19</span>
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 accent-purple-600 rounded-lg"
                    onChange={e => setFormData({...formData, covid_vaccinated: e.target.checked})}
                  />
                </label>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 ml-2 font-bold uppercase">Último resultado ETS</label>
                  <select 
                    className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-white outline-none"
                    onChange={e => setFormData({...formData, std_status: e.target.value})}
                  >
                    <option value="prefiero_no_decir">Prefiero no decir</option>
                    <option value="negativo">Negativo (-)</option>
                    <option value="positivo">Positivo (+)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ubicación Indicator */}
            <div className="flex items-center justify-center p-4 rounded-2xl bg-zinc-800/30 border border-dashed border-zinc-700">
              <MapPin className={`w-5 h-5 mr-2 ${gpsStatus === 'success' ? 'text-green-500' : 'text-zinc-500 animate-pulse'}`} />
              <span className="text-sm text-zinc-400 italic">
                {gpsStatus === 'loading' && "Localizando satélites..."}
                {gpsStatus === 'success' && "Ubicación fijada automáticamente ✓"}
                {gpsStatus === 'error' && "GPS no disponible"}
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl shadow-xl hover:shadow-purple-500/20 active:scale-95 transition-all flex justify-center items-center gap-3"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "GUARDAR Y EMPEZAR"}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2 text-zinc-500 text-xs hover:text-white transition-colors uppercase tracking-widest font-bold"
              >
                Configurar más tarde
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};