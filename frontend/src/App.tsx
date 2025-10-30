import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import About from "./pages/About";
import AuthPage from "./pages/AuthPage";
import AssessmentCenter from "./pages/AssessmentCenter";
import SettingsPage from "./pages/Settings";
import ProgressPage from "./pages/Progress";
import Resources from "./components/Resources";
import Community from "./components/Community";
import Achievements from "./components/Achievements";
import AITherapist from "./pages/AITherapist";
import Mindfulness from "./pages/Mindfulness";
import Gamification from "./pages/Gamification";
import EmergencyHelp from "./pages/EmergencyHelp";
import MoodTracker from "./pages/MoodTracker";
import WellnessGames from "./pages/WellnessGames";
import SpotifyWellness from "./pages/SpotifyWellness";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/wellness-games" element={<WellnessGames />} />
          <Route path="/spotify-wellness" element={<SpotifyWellness />} />
          <Route path="/assessment-center" element={<AssessmentCenter />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/community" element={<Community />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/ai-therapist" element={<AITherapist />} />
          <Route path="/mindfulness" element={<Mindfulness />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/emergency-help" element={<EmergencyHelp />} />
          <Route path="/mood-tracker" element={<MoodTracker />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;