import { useState } from 'react';
import  Card  from '../components/card/Cards';
import  Input  from '../components/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Button } from '../components/button';
import { Search, TrendingUp, Users, Hash } from 'lucide-react';

interface TrendingTopic {
  tag: string;
  category: string;
  posts: string;
  trend: 'up' | 'down' | 'stable';
}

interface SuggestedUser {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  isFollowing: boolean;
}
//MockData
const trendingTopics: TrendingTopic[] = [
  { tag: '#TechInnovation', category: 'Tecnologia', posts: '23.4k', trend: 'up' },
  { tag: '#Desenvolvimento', category: 'Programação', posts: '15.8k', trend: 'up' },
  { tag: '#Design', category: 'Criatividade', posts: '12.3k', trend: 'stable' },
  { tag: '#Startup', category: 'Negócios', posts: '9.7k', trend: 'up' },
  { tag: '#IA', category: 'Tecnologia', posts: '8.2k', trend: 'up' },
  { tag: '#WebDev', category: 'Programação', posts: '7.1k', trend: 'stable' },
];

const suggestedUsers: SuggestedUser[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Tech enthusiast | Full Stack Developer',
    followers: 12500,
    isFollowing: false,
  },
  {
    id: '2',
    name: 'Juliana Lima',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    bio: 'UX/UI Designer | Creative thinker',
    followers: 8300,
    isFollowing: false,
  },
  {
    id: '3',
    name: 'Roberto Alves',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    bio: 'Entrepreneur | Startup Advisor',
    followers: 15200,
    isFollowing: false,
  },
  {
    id: '4',
    name: 'Fernanda Costa',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
    bio: 'Data Scientist | AI Researcher',
    followers: 9800,
    isFollowing: false,
  },
];

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(suggestedUsers);

  const handleFollow = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
    ));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  //Design
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Explorar</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar pessoas, tópicos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-4 sm:py-6 text-base sm:text-lg"
          />
        </div>
      </div>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trending" className="gap-2">
            <Hash className="w-4 h-4" />
            Em Alta
          </TabsTrigger>
          <TabsTrigger value="people" className="gap-2">
            <Users className="w-4 h-4" />
            Pessoas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6 space-y-3">
          {trendingTopics.map((topic, index) => (
            <Card
              key={index}
              className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{topic.category}</span>
                    {topic.trend === 'up' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs">Em alta</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{topic.tag}</h3>
                  <p className="text-sm text-gray-500">{topic.posts} posts</p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Hash className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="people" className="mt-6 space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3 sm:gap-4">
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    </div>
                    <Button
                      onClick={() => handleFollow(user.id)}
                      variant={user.isFollowing ? 'outline' : 'default'}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      {user.isFollowing ? 'Seguindo' : 'Seguir'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{user.bio}</p>
                  <p className="text-xs text-gray-500">
                    {user.followers.toLocaleString('pt-BR')} seguidores
                  </p>
                </div>
              </div>
            </Card>
          ))}
          {filteredUsers.length === 0 && (
            <Card className="p-8 sm:p-12 text-center">
              <p className="text-gray-500">Nenhum resultado encontrado</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
