import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MessageCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Input } from '../components/ui/input';
import { useState } from 'react';

export function Messages() {
  const { chats, people, getMessagesForChat } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const chatsWithPeople = chats.map(chat => {
    const person = people.find(p => p.id === chat.participantId);
    const messages = getMessagesForChat(chat.participantId);
    return { chat, person, messages };
  }).filter(({ person }) => 
    person && person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedChats = chatsWithPeople.sort((a, b) => {
    const aTime = a.chat.lastMessage?.timestamp || '0';
    const bTime = b.chat.lastMessage?.timestamp || '0';
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Mensajes</h1>
        <p className="text-muted-foreground">Tus conversaciones activas</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {sortedChats.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">Sin conversaciones</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'No se encontraron conversaciones' : 'Explora perfiles y envía tu primer mensaje'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedChats.map(({ chat, person }) => {
            if (!person) return null;
            
            return (
              <Card 
                key={chat.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/chat/${person.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={person.photo} 
                        alt={person.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      {chat.unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 px-2 py-0 h-5 text-xs"
                        >
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="font-medium truncate">{person.name}</h3>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(chat.lastMessage?.timestamp)}
                        </span>
                      </div>
                      {chat.lastMessage && (
                        <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {chat.lastMessage.senderId === 'current-user' ? 'Tú: ' : ''}
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
