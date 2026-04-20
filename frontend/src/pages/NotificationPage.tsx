import  Card  from '../components/card/Cards';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs';
import { Button } from '../components/button';
import { Heart, MessageCircle, UserPlus, Repeat2 } from 'lucide-react';


interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'repost';
  user: {
    name: string;
    avatar: string;
  };
  content?: string;
  timestamp: Date;
  read: boolean;
}

//MockData
const notifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'Maria Santos',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    },
    content: 'curtiu seu post',
    timestamp: new Date(Date.now() - 3600000),
    read: false,
  },
  {
    id: '2',
    type: 'follow',
    user: {
      name: 'Pedro Costa',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    content: 'começou a seguir você',
    timestamp: new Date(Date.now() - 7200000),
    read: false,
  },
  {
    id: '3',
    type: 'comment',
    user: {
      name: 'Ana Oliveira',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    },
    content: 'comentou no seu post: "Que incrível! Parabéns pelo trabalho"',
    timestamp: new Date(Date.now() - 10800000),
    read: true,
  },
  {
    id: '4',
    type: 'repost',
    user: {
      name: 'Carlos Silva',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    },
    content: 'compartilhou seu post',
    timestamp: new Date(Date.now() - 14400000),
    read: true,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return <Heart className="w-5 h-5 text-red-500 fill-current" />;
    case 'comment':
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case 'follow':
      return <UserPlus className="w-5 h-5 text-green-500" />;
    case 'repost':
      return <Repeat2 className="w-5 h-5 text-purple-500" />;
  }
};

export function NotificationsPage() {
  const unreadCount = notifications.filter(n => !n.read).length;
  //Design
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notificações</h1>
        {unreadCount > 0 && (
          <p className="text-gray-600 mt-1">
            Você tem {unreadCount} {unreadCount === 1 ? 'nova notificação' : 'novas notificações'}
          </p>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">Todas</TabsTrigger>
          <TabsTrigger value="mentions" className="text-xs sm:text-sm">Menções</TabsTrigger>
          <TabsTrigger value="likes" className="text-xs sm:text-sm">Curtidas</TabsTrigger>
          <TabsTrigger value="follows" className="text-xs sm:text-sm">Seguidores</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                  <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{notification.user.name}</span>
                    {' '}
                    <span className="text-gray-600">{notification.content}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    
                  </p>
                </div>
                {notification.type === 'follow' && (
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    Seguir de volta
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mentions" className="mt-6">
          <Card className="p-8 sm:p-12 text-center">
            <p className="text-gray-500">Nenhuma menção ainda</p>
          </Card>
        </TabsContent>

        <TabsContent value="likes" className="mt-6 space-y-2">
          {notifications
            .filter((n) => n.type === 'like')
            .map((notification) => (
              <Card key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                    <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{notification.user.name}</span>
                      {' '}
                      <span className="text-gray-600">{notification.content}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      
                    </p>
                  </div>
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="follows" className="mt-6 space-y-2">
          {notifications
            .filter((n) => n.type === 'follow')
            .map((notification) => (
              <Card key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                    <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{notification.user.name}</span>
                      {' '}
                      <span className="text-gray-600">{notification.content}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    Seguir de volta
                  </Button>
                </div>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
