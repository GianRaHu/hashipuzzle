
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Game from "./pages/Game";
import CustomGame from "./pages/CustomGame";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

// Navbar wrapper component that conditionally renders the navbar
const NavbarWrapper = () => {
  const location = useLocation();
  const isGamePage = location.pathname.includes('/game/');
  
  if (isGamePage) {
    return null;
  }
  
  return <Navbar />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-[100dvh] overflow-hidden">
            <main className="flex-1 overflow-auto pb-20 md:pb-0 md:pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/game/:difficulty" element={<Game />} />
                <Route path="/custom" element={<CustomGame />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/support" element={<Support />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <NavbarWrapper />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
