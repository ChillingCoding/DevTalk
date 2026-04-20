import { useState} from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import  {Button}  from '../components/button';
import  Input  from '../components/Input';
import  Label from '../components/label';
import Card from "../components/card/Cards";
import CardHeader from "../components/card/CardHeader";
import CardDescription from "../components/card/CardDescription";
import CardTitle from "../components/card/CardTitle";
import CardContent from '../components/card/CardContent';
import CardFooter from '../components/card/CardFooter';
import { toast } from 'sonner';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Chama useAuth.login, que por baixo faz fetch para /backend/api/auth/login.php
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login. Verifique suas credenciais.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-2xl w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
        <CardDescription>
          Digite seu email e senha para acessar
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <button type="button" className="text-sm text-blue-600 hover:underline">
                Esqueceu a senha?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          <div className="text-sm text-center text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/auth/register" className="text-blue-600 hover:underline font-medium">
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
export default LoginPage
