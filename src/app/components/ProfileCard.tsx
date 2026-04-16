import { Heart, MapPin, Calendar, MessageCircle } from 'lucide-react';
import { Person } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

interface ProfileCardProps {
  person: Person;
}

export function ProfileCard({ person }: ProfileCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/profile/${person.id}`)}>
      <div className="relative h-64">
        <img 
          src={person.photo} 
          alt={person.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-sm font-medium">{person.age} años</span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl mb-1">{person.name}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{person.location}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{person.bio}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {person.interests.slice(0, 3).map((interest) => (
            <Badge key={interest} variant="secondary" className="text-xs">
              {interest}
            </Badge>
          ))}
          {person.interests.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{person.interests.length - 3}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/chat/${person.id}`);
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chatear
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${person.id}`);
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}