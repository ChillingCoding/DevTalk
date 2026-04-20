import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Button } from '../components/button';
import Card from '../components/card/Cards';
import Input from '../components/Input';
import Label from '../components/label';
import { Textarea } from '../components/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/dialog';
import { Settings, Calendar, Camera } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://127.0.0.1:8000';
const CROP_VIEWPORT_SIZE = 288;
const AVAILABLE_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop',
];

type ImageMeta = {
  naturalWidth: number;
  naturalHeight: number;
};

type RenderMetrics = {
  renderScale: number;
  renderedWidth: number;
  renderedHeight: number;
  centerX: number;
  centerY: number;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Não foi possível carregar a imagem.'));
    img.src = src;
  });

function computeRenderMetrics(meta: ImageMeta, zoom: number, viewportSize: number): RenderMetrics {
  const baseScale = Math.max(viewportSize / meta.naturalWidth, viewportSize / meta.naturalHeight);
  const renderScale = baseScale * zoom;
  const renderedWidth = meta.naturalWidth * renderScale;
  const renderedHeight = meta.naturalHeight * renderScale;
  const centerX = (viewportSize - renderedWidth) / 2;
  const centerY = (viewportSize - renderedHeight) / 2;

  return { renderScale, renderedWidth, renderedHeight, centerX, centerY };
}

function clampPan(
  panX: number,
  panY: number,
  zoom: number,
  meta: ImageMeta | null,
  viewportSize: number
): { x: number; y: number } {
  if (!meta) return { x: 0, y: 0 };

  const metrics = computeRenderMetrics(meta, zoom, viewportSize);
  const minX = metrics.centerX;
  const maxX = -metrics.centerX;
  const minY = metrics.centerY;
  const maxY = -metrics.centerY;

  const clamp = (value: number, min: number, max: number): number => {
    if (min > max) return 0;
    return Math.min(max, Math.max(min, value));
  };

  return {
    x: clamp(panX, minX, maxX),
    y: clamp(panY, minY, maxY),
  };
}

async function createCroppedBlobFromTransform(
  imageUrl: string,
  zoom: number,
  panX: number,
  panY: number,
  viewportSize: number
): Promise<Blob> {
  const image = await loadImage(imageUrl);
  const meta: ImageMeta = {
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
  };

  const metrics = computeRenderMetrics(meta, zoom, viewportSize);
  const clampedPan = clampPan(panX, panY, zoom, meta, viewportSize);
  const imageLeft = metrics.centerX + clampedPan.x;
  const imageTop = metrics.centerY + clampedPan.y;

  const sourceX = Math.max(0, (0 - imageLeft) / metrics.renderScale);
  const sourceY = Math.max(0, (0 - imageTop) / metrics.renderScale);
  const sourceSize = Math.min(
    meta.naturalWidth - sourceX,
    meta.naturalHeight - sourceY,
    viewportSize / metrics.renderScale
  );

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível preparar o recorte da imagem.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

  if (!blob) {
    throw new Error('Não foi possível gerar a imagem recortada.');
  }

  return blob;
}

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const avatarSrc = user?.avatar || '/default-avatar.svg';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCoverDialogOpen, setIsCoverDialogOpen] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageMeta, setSelectedImageMeta] = useState<ImageMeta | null>(null);
  const [cropZoom, setCropZoom] = useState(1.6);
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 });

  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });

  useEffect(() => {
    setEditForm({
      name: user?.name || '',
      bio: user?.bio || '',
    });
  }, [user?.name, user?.bio]);

  const renderMetrics = useMemo(() => {
    if (!selectedImageMeta) return null;
    return computeRenderMetrics(selectedImageMeta, cropZoom, CROP_VIEWPORT_SIZE);
  }, [selectedImageMeta, cropZoom]);

  const imageStyle = useMemo(() => {
    if (!renderMetrics) return undefined;

    return {
      width: `${renderMetrics.renderedWidth}px`,
      height: `${renderMetrics.renderedHeight}px`,
      left: `${renderMetrics.centerX + cropPan.x}px`,
      top: `${renderMetrics.centerY + cropPan.y}px`,
    };
  }, [renderMetrics, cropPan.x, cropPan.y]);

  const joinedAtLabel = useMemo(() => {
    if (!user?.createdAt) {
      return 'Data de entrada indisponível';
    }

    const createdAtDate = new Date(user.createdAt);
    if (Number.isNaN(createdAtDate.getTime())) {
      return 'Data de entrada indisponível';
    }

    const formatted = new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(createdAtDate);
    return `Entrou em ${formatted}`;
  }, [user?.createdAt]);

  

  const handleSaveProfile = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/update-profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: editForm.name.trim(),
          bio: editForm.bio,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        updateUser({
          name: editForm.name.trim(),
          bio: editForm.bio,
        });
        setIsEditDialogOpen(false);
        toast.success('Perfil atualizado com sucesso!');
      } else {
        toast.error(data.message || 'Erro ao atualizar perfil no servidor.');
      }
    } catch (error) {
      toast.error('Erro de rede ao atualizar perfil.');
    }
  };

  const handleCoverImageChange = (coverImage: string) => {
    updateUser({ coverImage });
    setIsCoverDialogOpen(false);
    toast.success('Imagem de fundo atualizada com sucesso!');
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Seleciona um ficheiro de imagem válido.');
      return;
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      const image = await loadImage(objectUrl);

      setSelectedImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
      setSelectedImageMeta({
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      });
      setCropZoom(1.6);
      setCropPan({ x: 0, y: 0 });
      setIsCropDialogOpen(true);
    } catch {
      toast.error('Não foi possível carregar a imagem selecionada.');
    } finally {
      event.target.value = '';
    }
  };

  const closeCropDialog = () => {
    setIsCropDialogOpen(false);
    setSelectedImageMeta(null);
    setSelectedImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCropPan({ x: 0, y: 0 });
    setCropZoom(1.6);
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!selectedImageMeta) return;

    dragState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: cropPan.x,
      startPanY: cropPan.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active || !selectedImageMeta) return;

    const deltaX = event.clientX - dragState.current.startX;
    const deltaY = event.clientY - dragState.current.startY;

    const nextPan = clampPan(
      dragState.current.startPanX + deltaX,
      dragState.current.startPanY + deltaY,
      cropZoom,
      selectedImageMeta,
      CROP_VIEWPORT_SIZE
    );

    setCropPan(nextPan);
  };

  const handleCropPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.active = false;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore when pointer capture is no longer active.
    }
  };

  const handleZoomChange = (value: number) => {
    setCropZoom(value);
    setCropPan((prev) => clampPan(prev.x, prev.y, value, selectedImageMeta, CROP_VIEWPORT_SIZE));
  };

  const uploadCroppedAvatar = async () => {
    if (!selectedImageUrl || !user?.id) {
      toast.error('Não foi possível preparar o upload da foto.');
      return;
    }

    const parsedUserId = Number(user.id);
    if (!Number.isFinite(parsedUserId) || parsedUserId <= 0) {
      toast.error('ID de utilizador inválido para upload.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const blob = await createCroppedBlobFromTransform(
        selectedImageUrl,
        cropZoom,
        cropPan.x,
        cropPan.y,
        CROP_VIEWPORT_SIZE
      );

      const formData = new FormData();
      formData.append('user_id', String(parsedUserId));
      formData.append('avatar', new File([blob], `avatar_user_${parsedUserId}.png`, { type: 'image/png' }));

      const response = await fetch(`${API_BASE_URL}/api/profile/upload-avatar.php`, {
        method: 'POST',
        body: formData,
      });

      const body = await response.json().catch(() => null);
      if (!response.ok || !body || body.status !== 'success') {
        throw new Error(body?.message || 'Falha ao atualizar foto de perfil.');
      }

      const newAvatar = body.avatar_url || body.avatar_path;
      if (!newAvatar) {
        throw new Error('Resposta do servidor sem URL de avatar.');
      }

      updateUser({ avatar: newAvatar });
      toast.success('Foto de perfil atualizada com sucesso!');
      closeCropDialog();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer upload da foto.';
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  //Design
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileSelected}
      />

      <Card className="overflow-hidden">
        <div className="relative">
          <div className="h-40 sm:h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative group">
            <img src={user?.coverImage} alt="Cover" className="w-full h-full object-cover" />
            <button
              className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black hover:bg-black/90 text-white p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              type="button"
              onClick={() => setIsCoverDialogOpen(true)}
              title="Alterar imagem de fundo"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
            <div className="relative group">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 ring-4 ring-white">
                <AvatarImage src={avatarSrc} alt={user?.name} />
                <AvatarFallback className="text-2xl sm:text-3xl">{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <button
                className="absolute inset-0 bg-black hover:bg-black/90 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center"
                onClick={openFilePicker}
                type="button"
                title="Alterar foto de perfil"
              >
                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-14 sm:pt-20 px-4 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.name}</h1>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Editar Perfil
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>Atualize suas informações pessoais</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Descrição</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} type="button">
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProfile} type="button">Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <p className="text-gray-700 mb-4">{user?.bio}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{joinedAtLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <button className="hover:underline">
              <span className="font-semibold text-gray-900">{user?.following}</span>
              <span className="text-gray-600 ml-1">Seguindo</span>
            </button>
            <button className="hover:underline">
              <span className="font-semibold text-gray-900">{user?.followers}</span>
              <span className="text-gray-600 ml-1">Seguidores</span>
            </button>
            <div>
              <span className="font-semibold text-gray-900">{user?.posts}</span>
              <span className="text-gray-600 ml-1">Posts</span>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={isCoverDialogOpen} onOpenChange={setIsCoverDialogOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Selecionar imagem de fundo</DialogTitle>
            <DialogDescription>Escolhe uma das imagens disponíveis para usar no teu perfil.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {AVAILABLE_COVER_IMAGES.map((coverImage) => {
              const isSelected = user?.coverImage === coverImage;
              return (
                <button
                  key={coverImage}
                  type="button"
                  onClick={() => handleCoverImageChange(coverImage)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <img src={coverImage} alt="Opção de capa" className="w-full h-32 object-cover" />
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCoverDialogOpen(false)} type="button">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      {/* DIALOG DE RECORTE ATUALIZADO */}
      <Dialog open={isCropDialogOpen} onOpenChange={(open) => (!open ? closeCropDialog() : setIsCropDialogOpen(open))}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Ajustar foto de perfil</DialogTitle>
            <DialogDescription>
              A imagem está acinzentada. A área dentro do círculo será a sua nova foto de perfil em cores reais.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex justify-center">
              
              <div
                className="relative h-64 w-64 sm:h-72 sm:w-72 overflow-hidden bg-gray-900 flex items-center justify-center border border-gray-200 shadow-sm"
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerUp}
                onPointerLeave={handleCropPointerUp}
              >
                {selectedImageUrl && imageStyle ? (
                  <>
                    {/* Imagem de fundo: Visível em toda a área cinza */}
                    <img
                      src={selectedImageUrl}
                      alt="Preview"
                      className="absolute max-w-none pointer-events-none grayscale opacity-60"
                      style={imageStyle}
                      draggable={false}
                    />
                    
                    {/* Overlay de Círculo: Esta parte mostra a imagem "normal" e delimitada */}
                    <div 
                      className="absolute inset-0 pointer-events-none rounded-full border-2 border-white z-10"
                      style={{ boxShadow: '0 0 0 1000px rgba(0,0,0,0.3)' }}
                    />

                    {/* Imagem Colorida por baixo do círculo (opcional, para efeito visual luxuoso) */}
                     <img
                      src={selectedImageUrl}
                      alt="Recorte"
                      className="absolute max-w-none pointer-events-none z-0"
                      style={{
                        ...imageStyle,
                        clipPath: 'circle(50% at center)'
                      }}
                      draggable={false}
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    Sem imagem carregada
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="crop-zoom">Zoom</Label>
                <span className="text-xs text-gray-500">{(cropZoom * 10).toFixed(0)}%</span>
              </div>
              <Input
                id="crop-zoom"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={cropZoom}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                className="cursor-pointer"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeCropDialog} type="button" disabled={isUploadingAvatar}>
              Cancelar
            </Button>
            <Button onClick={uploadCroppedAvatar} type="button" disabled={isUploadingAvatar}>
              {isUploadingAvatar ? 'A enviar...' : 'Guardar foto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
