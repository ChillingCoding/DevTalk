import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  createdAt?: string | null;
  coverImage: string;
  followers: number;
  following: number;
  posts: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

interface ApiResponse {
  status?: string;
  message?: string;
  details?: string;
  user?: {
    id: number | string;
    name: string;
    avatar?: string | null;
    created_at?: string | null;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PROFILE_OVERRIDES_STORAGE_KEY = 'profile_overrides';


const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://127.0.0.1:8000';

type PersistedProfileFields = Pick<User, 'name' | 'bio' | 'coverImage'>;
type ProfileOverridesMap = Record<string, PersistedProfileFields>;

function buildApiUrl(path: string): string {
  if (!API_BASE_URL) return path;
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${base}${path}`;
}

function getApiErrorMessage(
  responseBody: ApiResponse | null,
  fallback: string,
  statusCode?: number,
  rawBody?: string
): string {
  if (!responseBody) {
    if (statusCode) return `${fallback} (HTTP ${statusCode})`;
    if (rawBody && rawBody.trim().length > 0) return `${fallback} (${rawBody.slice(0, 120)})`;
    return fallback;
  }
  if (responseBody.message && responseBody.details) {
    return `${responseBody.message} (${responseBody.details})`;
  }
  if (responseBody.message) {
    return responseBody.message;
  }
  if (statusCode) {
    return `${fallback} (HTTP ${statusCode})`;
  }
  if (rawBody && rawBody.trim().length > 0) {
    return `${fallback} (${rawBody.slice(0, 120)})`;
  }
  return fallback;
}

function normalizeAvatarUrl(avatar?: string | null): string {
  if (!avatar || avatar.trim().length === 0) {
    return '/default-avatar.svg';
  }

  if (/^https?:\/\//i.test(avatar)) {
    return avatar;
  }

  const normalizedPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
  return buildApiUrl(normalizedPath);
}



function readProfileOverrides(): ProfileOverridesMap {
  try {
    const raw = localStorage.getItem(PROFILE_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProfileOverridesMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function getProfileOverrides(userId: string): PersistedProfileFields | null {
  const map = readProfileOverrides();
  return map[userId] ?? null;
}

function saveProfileOverrides(userData: User): void {
  const map = readProfileOverrides();
  map[userData.id] = {
    name: userData.name,
    bio: userData.bio,
    coverImage: userData.coverImage,
  };
  localStorage.setItem(PROFILE_OVERRIDES_STORAGE_KEY, JSON.stringify(map));
}

function buildFrontendUser(apiUser: NonNullable<ApiResponse['user']>, email: string): User {
  
  return {
    id: String(apiUser.id),
    name: apiUser.name,
    email,
    bio: 'Novo membro da appSocial.',
    avatar: normalizeAvatarUrl(apiUser.avatar),
    createdAt: apiUser.created_at ?? null,
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop',
    followers: 0,
    following: 0,
    posts: 0,
  };
}

async function postJson<T>(url: string, payload: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      'Nao foi possivel ligar ao backend. Confirma se o PHP esta a correr (ex.: http://127.0.0.1:8000) e se o proxy do Vite esta ativo.'
    );
  }

  const rawText = await response.text();
  let responseBody: T | null = null;
  try {
    responseBody = (rawText ? JSON.parse(rawText) : null) as T | null;
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    const body = responseBody as ApiResponse | null;
    throw new Error(
      getApiErrorMessage(body, 'Erro na comunicacao com o servidor.', response.status, rawText)
    );
  }

  return responseBody as T;
}

async function postJsonWithPathFallback<T>(
  paths: string[],
  payload: Record<string, unknown>
): Promise<T> {
  let lastError: Error | null = null;

  for (const path of paths) {
    try {
      return await postJson<T>(buildApiUrl(path), payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const shouldTryNextPath =
        message.includes('HTTP 404') ||
        message.includes('HTTP 500') ||
        message.includes('HTTP 502') ||
        message.includes('Nao foi possivel ligar ao backend');

      // Tentamos o caminho seguinte para cobrir setups diferentes de backend.
      if (shouldTryNextPath) {
        lastError = error as Error;
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error('Erro na comunicacao com o servidor.');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  /**
   * Inicialização do Estado: Tenta recuperar a sessão do utilizador gravada no localStorage ao iniciar a aplicação.
   */
  const [user, setUser] = useState<User | null>(null);

  /**
   * Re-hidratação da Sessão: Recupera a sessão do browser para evitar logout involuntário ao atualizar a página.
   * Também aplica overrides de perfil guardados localmente.
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      const overrides = getProfileOverrides(parsedUser.id);
      const hydratedUser: User = {
        ...parsedUser,
        ...overrides,
        avatar: normalizeAvatarUrl(parsedUser.avatar),
      };
      setUser(hydratedUser);
    }
  }, []);

  /**
   * Persistência Automática: Sempre que o estado do utilizador muda, o localStorage é atualizado.
   */
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    //Envia credenciais para o endpoint PHP de login.
    const response = await postJsonWithPathFallback<ApiResponse>(
      ['/api/auth/login.php', '/backend/api/auth/login.php'],
      { email, password }
    );

    if (!response.user) {
      throw new Error('Resposta de login invalida: user em falta.');
    }

    //Normaliza o user do backend para o formato esperado no frontend.
    const baseUser = buildFrontendUser(response.user, email);
    const overrides = getProfileOverrides(baseUser.id);
    const loggedUser: User = {
      ...baseUser,
      ...overrides,
      avatar: normalizeAvatarUrl(baseUser.avatar),
    };

    //Persiste no estado + localStorage para proteger rotas e manter sessao.
    setUser(loggedUser);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    saveProfileOverrides(loggedUser);
  };

  const register = async (name: string, email: string, password: string) => {
    //Cria conta no endpoint PHP de registo.
    await postJsonWithPathFallback<ApiResponse>(
      ['/api/auth/register.php', '/backend/api/auth/register.php'],
      { name, email, password }
    );

    //Como o backend de registo atual nao devolve user, fazemos login a seguir.
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const nextAvatar =
        updates.avatar !== undefined ? normalizeAvatarUrl(updates.avatar) : user.avatar;
      const updatedUser: User = {
        ...user,
        ...updates,
        avatar: nextAvatar,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      saveProfileOverrides(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
