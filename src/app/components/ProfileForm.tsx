import { useState } from 'react';
import { supabase } from '../lib/supabase'; // Asegúrate de que la ruta sea correcta
import { toast } from 'sonner';
import { MapPin, Shield, Activity, User, Heart, Calendar, Loader2 } from 'lucide-react';

export const ProfileForm = ({ session }: { session: any }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    gender: '',
    sexual_orientation: '',
    birthday: '',
    location_name: '',
    lat: null as number | null,
    lng: null as number | null,
    covid_vaccinated: false,
    std_status: 'prefiero_no_decir',
    last_checkup: ''
  });

  // Función para obtener la ubicación automática (latitud y longitud)
  const getAutomaticLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData(prev => ({
        ...prev,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }));
      toast.success("📍 Ubicación GPS obtenida correctamente");
    }, (error) => {
      toast.error("No se pudo obtener la ubicación automáticamente");
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        ...formData,
        updated_at: new Date()
      })
      .eq('id', session.user.id);

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("¡Perfil guardado con éxito!");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <User className="text-purple-500" /> Personalizar mi Perfil
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Fila 1: Username y Nombre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 ml-1 font-medium">Nombre de Usuario</label>
            <input 
              type="text" 
              placeholder="@ejemplo"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 ml-1 font-medium">Nombre Real</label>
            <input 
              type="text" 
              placeholder="Tu nombre completo"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
        </div>

        {/* Fila 2: Orientación y Sexo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 ml-1 font-medium">Sexo / Género</label>
            <select 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="">Selecciona...</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="no_binario">No binario</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 ml-1 font-medium flex items-center gap-1">
               Orientación <Heart className="w-3 h-3 text-pink-500" />
            </label>
            <select 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
              onChange={(e) => setFormData({...formData, sexual_orientation: e.target.value})}
            >
              <option value="">Selecciona...</option>
              <option value="hetero">Heterosexual</option>
              <option value="gay">Gay</option>
              <option value="lesbiana">Lesbiana</option>
              <option value="bi">Bisexual</option>
            </select>
          </div>
        </div>

        {/* SECCIÓN SALUD */}
        <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700 space-y-4">
          <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2 uppercase tracking-widest">
            <Shield className="w-4 h-4 text-emerald-500" /> Información de Salud
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
             <label className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-700/50 transition-all border border-zinc-700">
               <input 
                 type="checkbox" 
                 className="w-5 h-5 accent-purple-600"
                 onChange={(e) => setFormData({...formData, covid_vaccinated: e.target.checked})}
               />
               <span className="text-zinc-300">Vacunado COVID-19</span>
             </label>

             <select 
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 text-white outline-none"
              onChange={(e) => setFormData({...formData, std_status: e.target.value})}
            >
              <option value="prefiero_no_decir text-zinc-500">Resultado ETS (Último)</option>
              <option value="negativo">Negativo (-)</option>
              <option value="positivo">Positivo (+)</option>
              <option value="prefiero_no_decir">Prefiero no decirlo</option>
            </select>
          </div>

          <div className="space-y-2 text-sm">
             <label className="text-zinc-400 ml-1 flex items-center gap-2">
               <Calendar className="w-4 h-4" /> Fecha de último chequeo médico
             </label>
             <input 
               type="date" 
               className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 text-white outline-none"
               onChange={(e) => setFormData({...formData, last_checkup: e.target.value})}
             />
          </div>
        </div>

        {/* UBICACIÓN AUTOMÁTICA */}
        <div className="space-y-2">
           <label className="text-sm text-zinc-400 ml-1 font-medium flex items-center gap-2">
             <MapPin className="w-4 h-4 text-red-500" /> Ubicación
           </label>
           <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nombre de tu ciudad"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white outline-none"
                onChange={(e) => setFormData({...formData, location_name: e.target.value})}
              />
              <button 
                type="button"
                onClick={getAutomaticLocation}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
              >
                {formData.lat ? "✅ OK" : "GPS"}
              </button>
           </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-purple-500/20 hover:scale-[1.01] transition-all flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Guardar y Continuar"}
        </button>
      </form>
    </div>
  );
};