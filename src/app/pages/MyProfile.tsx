import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import {
  MapPin, Shield, AlignLeft,
  Loader2, Save, Camera, Heart, AtSign,
  Sparkles, Navigation, Zap, Plus, X, Image as ImageIcon,
  ChevronLeft, ChevronRight, Cake, Ruler, User
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';

export function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Validación mayor de 18 años
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const maxBirthDate = eighteenYearsAgo.toISOString().split('T')[0];

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (data) {
        if (data.sexual_orientation === 'hetero') data.sexual_orientation = 'hombres';
        if (data.sexual_orientation === 'gay') data.sexual_orientation = 'mujeres';
        if (data.sexual_orientation === 'bi') data.sexual_orientation = 'ambos';
      }
      setProfile(data);
    }
    setLoading(false);
  }

  const openZoom = (index: number | 'avatar') => {
    if (index === 'avatar') setCurrentPhotoIndex(-1);
    else setCurrentPhotoIndex(index);
    setIsZoomOpen(true);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex === null || currentPhotoIndex === -1) return;
    const nextIndex = (currentPhotoIndex + 1) % (profile.gallery?.length || 1);
    setCurrentPhotoIndex(nextIndex);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex === null || currentPhotoIndex === -1) return;
    const prevIndex = currentPhotoIndex === 0 ? (profile.gallery.length - 1) : currentPhotoIndex - 1;
    setCurrentPhotoIndex(prevIndex);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>, isGallery: boolean) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      if (isGallery) {
        const currentGallery = profile.gallery || [];
        setProfile({ ...profile, gallery: [...currentGallery, publicUrl] });
        toast.success("Foto añadida");
      } else {
        setProfile({ ...profile, avatar_url: publicUrl });
        toast.success("Avatar actualizado");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`Error al subir: ${error.message || 'Desconocido'}`);
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    const newGallery = profile.gallery.filter((_: any, index: number) => index !== indexToRemove);
    setProfile({ ...profile, gallery: newGallery });
    toast.info("Foto removida");
  };

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setProfile({ ...profile, lat: pos.coords.latitude, lng: pos.coords.longitude });
      toast.success("GPS actualizado");
    }, () => toast.error("Error GPS"));
  };

  async function handleUpdate() {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ ...profile, updated_at: new Date() }).eq('id', profile.id);
    if (error) toast.error("Error al guardar");
    else toast.success("¡Perfil actualizado!");
    setSaving(false);
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-rose-600" /></div>;

  return (
    <div className="min-h-screen bg-white text-zinc-950 pb-12 font-sans">
      {/* MODAL LIGHTBOX */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsZoomOpen(false)}>
          <button className="absolute top-6 right-6 text-white hover:text-rose-600"><X className="w-8 h-8" /></button>
          <div className="relative max-w-4xl w-full h-[80vh] flex items-center justify-center">
            {currentPhotoIndex !== -1 && profile?.gallery?.length > 1 && (
              <>
                <button onClick={handlePrevPhoto} className="absolute left-0 z-20 p-2 bg-white/10 rounded-full text-white"><ChevronLeft className="w-8 h-8" /></button>
                <button onClick={handleNextPhoto} className="absolute right-0 z-20 p-2 bg-white/10 rounded-full text-white"><ChevronRight className="w-8 h-8" /></button>
              </>
            )}
            <img src={currentPhotoIndex === -1 ? profile?.avatar_url : profile?.gallery[currentPhotoIndex!]} className="max-w-full max-h-full object-contain rounded-xl border-2 border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-zinc-950">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-rose-600 fill-rose-600" />
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Mi Perfil</h1>
          </div>
          <Button onClick={handleUpdate} disabled={saving || uploading} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 h-10 text-sm font-bold uppercase border-2 border-zinc-950 drop-shadow-[3px_3px_0_rgba(0,0,0,1)] active:scale-95 transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Guardar
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA */}
        <div className="md:col-span-4 space-y-6">
          <div className="relative group cursor-pointer" onClick={() => openZoom('avatar')}>
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border-4 border-zinc-950 bg-white drop-shadow-[8px_8px_0_rgba(225,29,72,0.4)]">
              <img src={profile?.avatar_url || 'https://via.placeholder.com/400'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Avatar" />
            </div>
            <label className="absolute -bottom-2 -right-2 p-3 bg-zinc-950 rounded-xl cursor-pointer border-2 border-white z-20" onClick={(e) => e.stopPropagation()}>
              <Camera className="w-5 h-5 text-white" />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={uploading} />
            </label>
          </div>

          <Card className="border-2 border-zinc-950 shadow-none drop-shadow-[5px_5px_0_rgba(0,0,0,1)] rounded-2xl">
            <CardContent className="p-4">
              <h3 className="text-[10px] font-black flex items-center gap-2 mb-3 text-zinc-500 uppercase italic"><ImageIcon className="w-3 h-3 text-rose-600" /> Galería Fotos</h3>
              <div className="grid grid-cols-3 gap-2">
                {profile?.gallery?.map((url: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-lg border-2 border-zinc-950 overflow-hidden group/item cursor-pointer" onClick={() => openZoom(index)}>
                    <img src={url} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    <button onClick={(e) => removeGalleryImage(e, index)} className="absolute top-0 right-0 p-1 bg-rose-600 text-white border-l-2 border-b-2 border-zinc-950 opacity-0 group-hover/item:opacity-100 transition-opacity z-10"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                {(!profile?.gallery || profile.gallery.length < 6) && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-zinc-950 flex items-center justify-center cursor-pointer hover:bg-rose-50 transition-colors">
                    <Plus className="w-5 h-5 text-zinc-400" /><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={uploading} />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-zinc-950 shadow-none drop-shadow-[5px_5px_0_rgba(0,0,0,1)] rounded-2xl">
            <CardContent className="p-4">
              <h3 className="text-[10px] font-black flex items-center gap-2 mb-3 text-zinc-500 uppercase italic"><Navigation className="w-3 h-3 text-rose-600" /> Ubicación</h3>
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border-2 border-zinc-950">
                <span className="text-xs font-mono font-bold">{profile?.lat ? `${profile.lat.toFixed(3)}, ${profile.lng.toFixed(3)}` : "Sin señal"}</span>
                <Button variant="ghost" size="sm" onClick={handleGetLocation} className="h-7 px-2 text-[10px] font-black border border-zinc-950 bg-white shadow-[2px_2px_0_rgba(0,0,0,1)] active:shadow-none transition-all">GPS</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="md:col-span-8 space-y-6">
          <section className="grid grid-cols-1 gap-5">
            <h3 className="text-sm font-black flex items-center gap-2 text-zinc-950 uppercase italic tracking-tight"><Sparkles className="w-5 h-5 text-rose-600" /> Datos Principales</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Nombre</label><Input className="bg-white border-2 border-zinc-950 rounded-xl h-11 font-bold outline-none" value={profile?.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Username</label><Input className="bg-white border-2 border-zinc-950 rounded-xl h-11 font-bold outline-none" value={profile?.username || ''} onChange={e => setProfile({ ...profile, username: e.target.value })} /></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 flex items-center gap-1"><Cake className="w-3 h-3" /> Cumpleaños</label>
                <Input type="date" max={maxBirthDate} className="bg-white border-2 border-zinc-950 rounded-xl h-11 font-bold outline-none" value={profile?.birthday || ''} onChange={e => setProfile({ ...profile, birthday: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 flex items-center gap-1"><Ruler className="w-3 h-3" /> Estatura</label>
                <Input type="text" className="bg-white border-2 border-zinc-950 rounded-xl h-11 font-bold outline-none" placeholder="1.70m" value={profile?.estatura || ''} onChange={e => setProfile({ ...profile, estatura: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 flex items-center gap-1"><User className="w-3 h-3" /> Complexión</label>
                <select className="w-full h-11 px-3 bg-white border-2 border-zinc-950 rounded-xl text-sm font-bold outline-none" value={profile?.complexion || ''} onChange={e => setProfile({ ...profile, complexion: e.target.value })}>
                  <option value="">Seleccionar</option>
                  <option value="delgada">Delgada</option>
                  <option value="atletica">Atlética</option>
                  <option value="media">Media</option>
                  <option value="robusta">Robusta</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Biografía</label>
              <textarea className="w-full h-24 p-3 bg-white border-2 border-zinc-950 rounded-xl text-sm font-medium outline-none focus:border-rose-600 transition-all resize-none drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" value={profile?.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
            </div>

            {/* SECCIÓN DE GÉNERO E INTERÉS RESTAURADA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Género</label>
                <select className="w-full h-11 px-3 bg-white border-2 border-zinc-950 rounded-xl text-sm font-bold outline-none cursor-pointer" value={profile?.gender || ''} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Me interesa</label>
                <select className="w-full h-11 px-3 bg-white border-2 border-zinc-950 rounded-xl text-sm font-bold outline-none cursor-pointer" value={profile?.sexual_orientation || ''} onChange={e => setProfile({ ...profile, sexual_orientation: e.target.value })}>
                  <option value="hombres">Hombres</option>
                  <option value="mujeres">Mujeres</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
            </div>
          </section>

          <section className="p-5 bg-emerald-50 rounded-2xl border-2 border-zinc-950 drop-shadow-[5px_5px_0_rgba(16,185,129,0.2)]">
            <h3 className="text-[11px] font-black flex items-center gap-2 text-emerald-900 tracking-tighter uppercase italic mb-4"><Shield className="w-4 h-4 text-emerald-600" /> Seguridad & Salud</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-xl border-2 border-zinc-950 hover:border-emerald-500 transition-all">
                <span className="text-xs font-black uppercase tracking-tight">Vacunación COVID-19</span>
                <input type="checkbox" className="w-6 h-6 rounded accent-emerald-600 border-2 border-zinc-950" checked={profile?.covid_vaccinated || false} onChange={e => setProfile({ ...profile, covid_vaccinated: e.target.checked })} />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-emerald-800 uppercase ml-1">Status ETS</label>
                  <select className="w-full h-10 px-3 bg-white border-2 border-zinc-950 rounded-xl text-xs font-bold outline-none" value={profile?.std_status || 'prefiero_no_decir'} onChange={e => setProfile({ ...profile, std_status: e.target.value })}>
                    <option value="prefiero_no_decir">Reservado</option>
                    <option value="negativo">Negativo (-)</option>
                    <option value="positivo">Positivo (+)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-emerald-800 uppercase ml-1">Último Test</label>
                  <Input type="date" max={todayStr} className="bg-white border-2 border-zinc-950 rounded-xl h-10 text-xs font-bold" value={profile?.last_checkup || ''} onChange={e => setProfile({ ...profile, last_checkup: e.target.value })} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}