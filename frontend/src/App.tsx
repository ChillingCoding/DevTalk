import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthContext"
import  { router }  from "./routes"
import { Toaster } from './components/sonner';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}