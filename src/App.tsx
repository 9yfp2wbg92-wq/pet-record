import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Timeline } from './pages/Timeline';
import { AIInsights } from './pages/AIInsights';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { BottomNav } from './components/BottomNav';
import { PetSelector } from './components/PetSelector';
import { usePetStore } from './hooks/usePetStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
 const { currentUser } = usePetStore();
 return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
 const { loadData, currentUser } = usePetStore();

 useEffect(() => {
  loadData();
 }, [loadData]);

 return (
  <Router>
   <Routes>
    <Route path="/login" element={<Login />} />

    <Route
     path="/*"
     element={
      <ProtectedRoute>
       <div className="min-h-screen bg-background">
        <Routes>
         <Route
          path="/"
          element={
           <>
            <PetSelector />
            <Home />
           </>
          }
         />
         <Route path="/timeline" element={<Timeline />} />
         <Route path="/ai" element={<AIInsights />} />
         <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNav />
       </div>
      </ProtectedRoute>
     }
    />
   </Routes>
  </Router>
 );
}
