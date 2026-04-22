/**
 * Layout - wraps all pages with the primary navigation bar.
 */
import { Outlet } from 'react-router';
import NavBar from './NavBar';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
