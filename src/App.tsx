/**
 * App — root component. Defines client-side routes for the full swipe flow.
 *
 * Routes:
 *   /          - Login
 *   /playlists - Playlist selection
 *   /mode      - Add or remove mode selection
 *   /swipe     - Interactive swipe screen
 *   /about     - About page
 */
import { createBrowserRouter, RouterProvider } from 'react-router';
import './App.css';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PlaylistPage from './pages/PlaylistPage';
import ModePage from './pages/ModePage';
import SwipePage from './pages/SwipePage';
import AboutPage from './pages/AboutPage';

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <LoginPage /> },
        { path: '/playlists', element: <PlaylistPage /> },
        { path: '/mode', element: <ModePage /> },
        { path: '/swipe', element: <SwipePage /> },
        { path: '/about', element: <AboutPage /> },
      ],
    },
  ],
  { basename: '/p89' },
);

export default function App() {
  return <RouterProvider router={router} />;
}
