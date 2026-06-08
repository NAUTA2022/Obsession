import { Outlet } from 'react-router-dom';

/**
 * Shell full-screen para /call/:bookingId. Sin Sidebar/Navbar.
 * El overlay de la llamada (CallOverlay) lo monta el CallProvider global;
 * este layout solo provee el contenedor a pantalla completa.
 */
export default function CallLayout() {
  return (
    <div className="fixed inset-0 z-[1] bg-[#0f1419]">
      <Outlet />
    </div>
  );
}
