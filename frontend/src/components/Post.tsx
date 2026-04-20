import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import  Card  from './card/Cards';
import { Button } from './button';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Loader2, Send, Smile } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://127.0.0.1:8000';

function buildApiUrl(path: string): string {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${base}${path}`;
}

const EMOJIS = ['😀','😂','🥺','😎','😍','🔥','🙏','✨','💯','🤔','🙌','👀','👍','❤️','🎉','😢','🚀','💡'];

export interface CommentData {
  id: string;
  email: string;
  name: string;
  avatar: string;
  content: string;
  created_at: string;
}



export interface PostData {
  id: string;
  user_id?: string;
  author: {
    name: string;
    avatar: string;
    email?: string;
  };
  content: string;
  image?: string;

  image_url?: string | null;
  created_at?: string;
  timestamp?: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface PostProps {
  post: PostData;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onCommentSuccess?: (postId: string) => void;
}

export function Post({ post, onLike, onComment, onBookmark, onDelete, onCommentSuccess }: PostProps) {
  const { user } = useAuth();
  
  /**
   * Gestão de Estado Local: Controla a visibilidade dos comentários, lista de dados e indicadores de carregamento.
   */
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<CommentData[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  /**
   * Sincronização de Perfil: Garante que os dados do autor (nome/avatar) estejam sempre atualizados se o post for do utilizador logado.
   */
  const isAuthorMe = user?.email && post.author.email?.toLowerCase() === user.email.toLowerCase();
  const authorName = isAuthorMe ? user.name : post.author.name;
  const authorAvatar = isAuthorMe ? user.avatar : post.author.avatar;

  // Efeito para carregar comentários quando a janela abre
  useEffect(() => {
    if (showComments) {
      setLoadingComments(true);
      fetch(buildApiUrl(`/api/feed/comentarios/get-comments.php?post_id=${post.id}`))
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setCommentsList(data.comments || []);
          }
        })
        .catch(err => console.error("Erro a carregar comentários:", err))
        .finally(() => setLoadingComments(false));
    }
  }, [showComments, post.id]);

  /**
   * Comunicação com a API: Envio de novos comentários para o servidor
   */
  const handlePostComment = async () => {
    if (!commentText.trim() || !user?.email) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(buildApiUrl('/api/feed/comentarios/create-comment.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: Number(post.id),
          email: user.email,
          content: commentText.trim()
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
         setCommentsList(prev => [...prev, data.comment]);
         setCommentText('');
         setShowEmojis(false);
         if (onCommentSuccess) {
           onCommentSuccess(post.id);
         }
      } else {
         toast.error(data.message || 'Erro ao publicar comentário');
      }
    } catch (e) {
      toast.error('Erro de rede: não foi possível enviar o comentário');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex gap-3 sm:gap-4">
        <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
          <AvatarImage src={authorAvatar} alt={authorName} />
          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{authorName}</p>
            </div>
            {onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(post.id)}
                  >
                    Apagar post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>

          {(post.image || post.image_url) && (
            <div className="rounded-xl overflow-hidden mt-4">
              <img
                src={post.image_url ?? post.image}
                alt="Post image"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${post.isLiked ? 'text-red-600' : 'text-gray-600'}`}
              onClick={() => onLike(post.id)}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
              {post.likes > 0 && <span>{post.likes}</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-600"
              onClick={() => {
                setShowComments(true);
                onComment(post.id);
              }}
            >
              <MessageCircle className="w-5 h-5" />
              {post.comments > 0 && <span>{post.comments}</span>}
            </Button>
          </div>

          {/* Modal de Comentários / Detalhe do Post */}
          <Dialog open={showComments} onOpenChange={setShowComments}>
            <DialogContent className="sm:max-w-[95vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl p-0 overflow-hidden bg-gray-100 border-none gap-0 w-full">
              <DialogTitle className="sr-only">Comentários do Post</DialogTitle>
              <DialogDescription className="sr-only">
                Modal para visualização de detalhes do post e interação através de comentários.
              </DialogDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-[75vh] max-h-[95vh]">
                
                {/* Lado Esquerdo: Mensagem Destacada */}
                <div className="p-6 md:p-8 flex flex-col justify-center bg-gray-100 overflow-y-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={authorAvatar} alt={authorName} />
                      <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{authorName}</p>
                    </div>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap text-lg/relaxed">{post.content}</p>
                  {(post.image || post.image_url) && (
                    <div className="rounded-xl overflow-hidden mt-6">
                      <img
                        src={post.image_url ?? post.image}
                        alt="Post image"
                        className="w-full h-auto object-cover max-h-80"
                      />
                    </div>
                  )}
                </div>

                {/* Lado Direito: Comentários */}
                <div className="bg-white flex flex-col border-l border-gray-200">
                  <div className="p-4 border-b border-gray-100 shrink-0">
                    <h4 className="font-semibold text-gray-800 text-lg">Comentários {commentsList.length > 0 && <span className="text-gray-400 text-sm font-normal ml-1">({commentsList.length})</span>}</h4>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    {loadingComments ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    ) : commentsList.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center">
                        <MessageCircle className="w-12 h-12 text-gray-200 mb-4" />
                        <p className="text-gray-500 text-center font-medium">Ei! 💭</p>
                        <p className="text-gray-400 text-sm text-center mt-1">Sê o primeiro a comentar.</p>
                      </div>
                    ) : (
                      commentsList.map(c => (
                        <div key={c.id} className="flex gap-3">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage 
                              src={user?.email && c.email?.toLowerCase() === user.email.toLowerCase() ? user.avatar : c.avatar} 
                              alt={user?.email && c.email?.toLowerCase() === user.email.toLowerCase() ? user.name : c.name} 
                            />
                            <AvatarFallback>{(user?.email && c.email?.toLowerCase() === user.email.toLowerCase() ? user.name : c.name).charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-none">
                              <p className="font-semibold text-sm text-gray-900">
                                {user?.email && c.email?.toLowerCase() === user.email.toLowerCase() ? user.name : c.name}
                              </p>
                              <p className="text-gray-800 text-sm mt-1 whitespace-pre-wrap">{c.content}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 ml-2">Agora mesmo</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-100 shrink-0">
                    <div className="flex items-end gap-2">
                      <Avatar className="w-8 h-8 shrink-0 mb-1">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 relative">
                        <textarea
                          placeholder="Escreve um comentário..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y min-h-[80px] max-h-[250px]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handlePostComment();
                            }
                          }}
                        />
                        <div className="absolute top-3 right-3">
                           <button onClick={() => setShowEmojis(!showEmojis)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                              <Smile className="w-5 h-5" />
                           </button>
                           {showEmojis && (
                             <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-100 shadow-xl rounded-xl p-3 z-50 w-64 grid grid-cols-6 gap-1">
                               {EMOJIS.map(emoji => (
                                 <button 
                                   key={emoji} 
                                   onClick={() => setCommentText(prev => prev + emoji)} 
                                   className="text-2xl hover:bg-gray-100 rounded-lg p-1 aspect-square transition-transform active:scale-95 flex items-center justify-center cursor-pointer"
                                 >
                                   {emoji}
                                 </button>
                               ))}
                             </div>
                           )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        className="rounded-full mb-1 shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        disabled={!commentText.trim() || submittingComment}
                        onClick={handlePostComment}
                      >
                        {submittingComment ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white ml-px" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
}
