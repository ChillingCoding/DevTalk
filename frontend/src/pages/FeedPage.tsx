import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import  CreatePost  from "../components/CreatePost";
import { Post, type PostData } from '../components/Post';
import  Card  from '../components/card/Cards';
import { Button } from '../components/button';
import { TrendingUp, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Utilitários para comunicação com a API
 */
const API_BASE_URL = 'http://127.0.0.1:8000';

function buildApiUrl(path: string) {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${base}${path}`;
}

/**
 * Mapeamento e transformação de dados da API para o formato do Frontend
 */
export function apiPostToPostData(p: any): PostData {
  return {
    id: p.id || p.id_post || Date.now().toString(),
    user_id: p.user_id || p.email,
    author: p.author ? { ...p.author, email: p.author.email || p.email } : {
      name: p.name || 'Membro appSocial',
      avatar: p.avatar || '/default-avatar.svg',
      email: p.email || '',
    },
    content: p.content || p.descricao || '',
    image_url: p.image_url || null,
    created_at: p.created_at || p.data_publicacao,
    likes: p.likes || 0,
    comments: p.comments || 0,
    shares: p.shares || 0,
    isLiked: p.isLiked || false,
    isBookmarked: false,
  };
}

//MockData
const trendingTopics = [
  { tag: '#TechInnovation', posts: '23.4k posts' },
  { tag: '#Desenvolvimento', posts: '15.8k posts' },
  { tag: '#Design', posts: '12.3k posts' },
  { tag: '#Startup', posts: '9.7k posts' },
];

const suggestedUsers = [
  {
    name: 'Carlos Silva',
    username: '@carlossilva',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
  {
    name: 'Juliana Lima',
    username: '@julianalima',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  },
  {
    name: 'Roberto Alves',
    username: '@robertoalves',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  },
];

export function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Lógica de Carregamento: Procura os posts no servidor e sincroniza com o estado do utilizador logado
   */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const emailParam = user?.email ? `?current_user=${encodeURIComponent(user.email)}` : '';
      const res = await fetch(buildApiUrl(`/api/feed/get-posts.php${emailParam}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const fetched: PostData[] = (json.posts as any[]).map(apiPostToPostData);
      setPosts(fetched);
    } catch (err) {
      console.error('Erro ao carregar posts:', err);
      toast.error('Não foi possível carregar o feed. Verifica se o backend está a correr.');
    } finally {
      setLoading(false);
    }
  }, [user, apiPostToPostData]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /**
   * Handlers de Interação: Criação, Like e Remoção de Posts
   */
  const handlePostCreated = useCallback(async (content: string, imageFile?: File | null): Promise<boolean> => {
    if (!user?.email) {
      toast.error('Tens de fazer login para publicar.');
      return false;
    }
    try {
      let finalImageUrl = undefined;

      //Faz upload da imagem primeiro se o utilizador submeteu
      if (imageFile) {
        const formData = new FormData();
        formData.append('media', imageFile);

        const uploadRes = await fetch(buildApiUrl('/api/feed/upload-media.php'), {
          method: 'POST',
          body: formData
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
           toast.error(uploadJson.message || 'Erro ao fazer upload da imagem.');
           return false;
        }
        finalImageUrl = uploadJson.absolute_url || uploadJson.url;
      }

      //Chama o endpoint create-post
      const res = await fetch(buildApiUrl('/api/feed/create-post.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          descricao: content,
          image_url: finalImageUrl 
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message ?? 'Erro ao publicar post.');
        return false;
      }
      
      const newPost = apiPostToPostData(json.post as any);
      setPosts((prev) => [newPost, ...prev]);
      return true;
    } catch {
      toast.error('Erro de ligação ao servidor.');
      return false;
    }
  }, [user]);

  
  const handleLike = useCallback(async (postId: string) => {
    if (!user?.email) {
      toast.error('Precisas de estar logado para dar like!');
      return;
    }

    
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );

    try {
      const res = await fetch(buildApiUrl('/api/feed/toggle-like.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: Number(postId), email: user.email }),
      });
      
      const data = await res.json();
      if (data.status !== 'success') {
        throw new Error(data.message);
      }
      
      // Sincroniza com o valor exato do servidor (opcional, para garantir precisão)
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: data.isLiked, likes: data.likes }
            : post
        )
      );
    } catch (error) {
      // Reverte em caso de erro
      fetchPosts();
      toast.error('Erro ao processar like no servidor.');
    }
  }, [user, fetchPosts]);

  const handleComment = useCallback((postId: string) => {
    console.log('Comment on post:', postId);
  }, []);

  const handleCommentSuccess = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    );
  }, []);

  const handleBookmark = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  }, []);

  //Apaga post via API 
  const handleDelete = useCallback(async (postId: string) => {
    if (!user?.email) return;
    try {
      const res = await fetch(buildApiUrl('/api/feed/delete-post.php'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: Number(postId), email: user.email }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message ?? 'Erro ao apagar post.');
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post apagado.');
    } catch {
      toast.error('Erro de ligação ao servidor.');
    }
  }, [user]);

  //Design
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* coluna principal */}
      <div className="lg:col-span-2 space-y-6">
        <CreatePost onPostCreated={handlePostCreated} />

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-10 text-center text-gray-500">
            <p className="text-lg font-medium">Ainda não há posts no feed.</p>
            <p className="text-sm mt-1">Sê o primeiro a publicar algo!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onBookmark={handleBookmark}
                onDelete={
                  post.user_id === user?.email ? handleDelete : undefined
                }
                onCommentSuccess={handleCommentSuccess}
              />
            ))}
          </div>
        )}
      </div>

      {/* barra lateral */}
      <div className="hidden lg:block space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-lg">Trending Topics</h2>
          </div>
          <div className="space-y-4">
            {trendingTopics.map((topic, index) => (
              <button
                key={index}
                className="w-full text-left hover:bg-gray-50 p-3 rounded-lg transition-colors"
              >
                <p className="font-semibold text-gray-900">{topic.tag}</p>
                <p className="text-sm text-gray-500">{topic.posts}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-lg">Sugestões para você</h2>
          </div>
          <div className="space-y-4">
            {suggestedUsers.map((suggestedUser, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={suggestedUser.avatar}
                    alt={suggestedUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{suggestedUser.name}</p>
                    <p className="text-xs text-gray-500">{suggestedUser.username}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Seguir</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}