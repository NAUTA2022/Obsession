import { Outlet } from 'react-router-dom';

/**
 * Layout para rutas públicas de autenticación (login). No incluye Sidebar/Navbar.
 * Las páginas hijas (p.ej. LoginPage con Thirdweb) traen su propio estilo full-screen.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full">
      <Outlet />
    </div>
  );
}
