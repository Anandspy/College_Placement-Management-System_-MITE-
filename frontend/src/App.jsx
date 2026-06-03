import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import AppRouter from './routes/AppRouter';
import { refreshAccessToken } from './features/auth/authThunks';

function App() {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);
  const [slowLoad, setSlowLoad] = useState(false);

  useEffect(() => {
    dispatch(refreshAccessToken());
    // If initialization takes longer than 5s, show a hint that the server is waking up
    const timer = setTimeout(() => setSlowLoad(true), 5000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium animate-pulse">Initializing session...</p>
        {slowLoad && (
          <p className="text-gray-400 text-sm mt-2">Waking up server, please wait...</p>
        )}
      </div>
    );
  }


  return (
    <BrowserRouter>
      {/* React Hot Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#1A7F4B',
            },
          },
          error: {
            style: {
              background: '#C0392B',
            },
          },
        }}
      />
      
      {/* All Application Routes */}
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
