import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import  {Button}  from '../components/button';
import  Input  from "../components/Input"
import Label  from '../components/label';
import Card from "../components/card/Cards";
import CardHeader from "../components/card/CardHeader";
import CardDescription from "../components/card/CardDescription";
import CardTitle from "../components/card/CardTitle";
import CardContent from '../components/card/CardContent';
import CardFooter from '../components/card/CardFooter';
import { toast } from 'sonner';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordRules = [
    { label: 'Pelo menos 8 caracteres', valid: password.length >= 8 },
    { label: 'Pelo menos 1 letra minúscula', valid: /[a-z]/.test(password) },
    { label: 'Pelo menos 1 letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'Pelo menos 1 número', valid: /[0-9]/.test(password) },
    { label: 'Pelo menos 1 símbolo (ex.: !@#$%)', valid: /[^a-zA-Z0-9]/.test(password) },
  ];

  const validatePassword = (value: string): string | null => {
    if (value.length < 8) return 'A senha deve ter pelo menos 8 caracteres';
    if (!/[a-z]/.test(value)) return 'A senha deve ter pelo menos 1 letra minúscula';
    if (!/[A-Z]/.test(value)) return 'A senha deve ter pelo menos 1 letra maiúscula';
    if (!/[0-9]/.test(value)) return 'A senha deve ter pelo menos 1 número';
    if (!/[^a-zA-Z0-9]/.test(value)) return 'A senha deve ter pelo menos 1 símbolo (ex.: !@#$%)';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      // Chama useAuth.register, que cria conta no backend e depois faz login automatico.
      await register(name, email, password);
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-2xl w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Criar uma conta</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para começar
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="rounded-md bg-gray-50 border border-gray-200 p-3 space-y-1">
              {passwordRules.map((rule) => (
                <p
                  key={rule.label}
                  className={`text-xs leading-relaxed ${rule.valid ? 'text-green-700' : 'text-gray-600'}`}
                >
                  {rule.valid ? '✓' : '•'} {rule.label}
                </p>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </Button>
          <div className="text-sm text-center text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/auth/login" className="text-blue-600 hover:underline font-medium">
              Entrar
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
