import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Index from './pages/Index';
import Game from './pages/Game';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/play/:difficulty',
    element: <Game />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
