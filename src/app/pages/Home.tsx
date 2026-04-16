import { Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfileCard } from '../components/ProfileCard';
import { Input } from '../components/ui/input';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { supabase } from '../lib/supabase';
import { OnboardingModal } from '../components/OnboardingModal';

export function Home() {
  const { people, currentUserProfile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true); // NUEVO: Evita parpadeos del modal
  // --- LÓGICA DE DETECCIÓN DE PERFIL INCOMPLETO ---
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setCurrentUserId(session.user.id);
          
          // 1. Revisamos si el usuario ya vio el onboarding en esta PC
          const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${session.user.id}`);

          if (!hasSeenOnboarding) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', session.user.id)
              .single();

            // 2. Si no tiene nombre Y no lo ha visto antes, lo abrimos
            if (!profile?.full_name) {
              setIsModalOpen(true);
              // 3. Marcamos inmediatamente que YA LO VIO para que no repita
              localStorage.setItem(`onboarding_seen_${session.user.id}`, 'true');
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsChecking(false);
      }
    };
    checkUser();
  }, []);

  const locations = Array.from(new Set(people.map(p => p.location)));

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.interests.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = locationFilter === 'all' || person.location === locationFilter;
    
    // Compatibility Filter
    let matchesCompatibility = true;
    if (currentUserProfile?.gender && currentUserProfile?.sexual_orientation && person.gender && person.sexual_orientation) {
      const myGender = currentUserProfile.gender;
      const myInterest = currentUserProfile.sexual_orientation; // 'hombres', 'mujeres', 'ambos'
      const theirGender = person.gender;
      const theirInterest = person.sexual_orientation;

      // Define function to check interest vs gender
      const checksInterest = (interest: string, gender: string) => {
        if (interest === 'ambos') return true;
        if (interest === 'hombres' && gender.startsWith('hombre')) return true;
        if (interest === 'mujeres' && gender.startsWith('mujer')) return true;
        return false;
      };

      const iLikeThem = checksInterest(myInterest, theirGender);
      const theyLikeMe = checksInterest(theirInterest, myGender);

      matchesCompatibility = iLikeThem && theyLikeMe;
    }

    return matchesSearch && matchesLocation && matchesCompatibility;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {!isChecking && currentUserId && (
        <OnboardingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          userId={currentUserId} 
        />
      )}
     

      <div className="mb-8">
        <h1 className="text-2xl mb-2">Redescubre la emoción de conocer a alguien nuevo</h1>
      </div>



      {filteredPeople.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron perfiles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person) => (
            <ProfileCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
