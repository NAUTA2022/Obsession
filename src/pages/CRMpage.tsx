import { Outlet } from 'react-router-dom';

export default function CRMpage() {
  return (
    <div className="w-full flex-1">
      <Outlet />
    </div>
  );
}
