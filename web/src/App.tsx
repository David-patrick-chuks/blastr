import "./index.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { AuthCallback } from "./pages/AuthCallback";
import { SMTPGuideView } from "./pages/SMTPGuideView";
import { authService } from "./services/index";

function LandingPageWrapper() {
  const navigate = useNavigate();
  return <LandingPage onGetStarted={() => navigate('/dashboard')} />;
}

function DashboardWrapper() {
  return <Dashboard onLogout={() => authService.logout()} />;
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    authService.getSession().then((s: any) => {
      setSession(s);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = authService.onAuthStateChange((session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-blue-500">INIT_BLASTR_CORE...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-500/30">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={session ? <Navigate to="/dashboard" replace /> : <LandingPageWrapper />}
          />
          <Route path="/guide/smtp" element={<SMTPGuideView />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/dashboard/*"
            element={session ? <DashboardWrapper /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
