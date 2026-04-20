import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { Textarea } from './textarea';
import  Card  from './card/Cards';
import { Image, Smile, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface CreatePostProps {
  /** Retorna true se o post foi criado com sucesso */
  onPostCreated: (content: string, imageFile?: File | null) => Promise<boolean>;
}

const EMOJIS = ['😀','😂','🥺','😎','😍','🔥','🙏','✨','💯','🤔','🙌','👀','👍','❤️','🎉','😢','🚀','💡'];

function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [publishing, setPublishing] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) {
      toast.error('Escreva ou anexe algo antes de publicar');
      return;
    }

    setPublishing(true);
    const ok = await onPostCreated(content.trim(), imageFile);
    setPublishing(false);

    if (ok) {
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setShowEmojis(false);
      toast.success('Post publicado com sucesso!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      e.target.value = ''; 
    }
  };

  return (
    <Card className="p-4 sm:p-6 pb-4">
      <div className="flex gap-3 sm:gap-4">
        <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea
            placeholder="No que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[70px] resize-none border-0 focus-visible:ring-0 p-0 pt-2 sm:pt-3 text-base sm:text-lg"
            disabled={publishing}
          />

          {imagePreview && (
            <div className="relative inline-block w-full">
              <img src={imagePreview} className="max-h-64 rounded-xl object-cover" />
              <button 
                onClick={() => {setImagePreview(null); setImageFile(null);}}
                className="absolute top-2 right-2 bg-gray-900/60 hover:bg-gray-900 transition-colors text-white rounded-full p-1 border border-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t relative">
            <div className="flex flex-wrap gap-2">
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
              <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="sm" className="gap-2 text-gray-600" disabled={publishing}>
                <Image className="w-5 h-5" />
                <span className="hidden sm:inline">Foto</span>
              </Button>

              <div className="relative">
                <Button onClick={() => setShowEmojis(!showEmojis)} variant="ghost" size="sm" className={`gap-2 ${showEmojis ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`} disabled={publishing}>
                  <Smile className="w-5 h-5" />
                  <span className="hidden sm:inline">Emoji</span>
                </Button>
                {showEmojis && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 shadow-xl rounded-xl p-3 z-50 w-64 grid grid-cols-6 gap-1">
                    {EMOJIS.map(emoji => (
                       <button 
                         key={emoji} 
                         onClick={() => setContent(prev => prev + emoji)} 
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
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageFile) || publishing}
              className="w-full sm:w-auto gap-2 px-6"
            >
              {publishing && <Loader2 className="w-4 h-4 animate-spin" />}
              {publishing ? 'A publicar…' : 'Publicar'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CreatePost;
