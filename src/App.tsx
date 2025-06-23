
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Enhanced navbar wrapper with better mobile handling
const NavbarWrapper = () => {
  const location = useLocation();
  const isGamePage = location.pathname.includes('/game/');
  const isAuthPage = location.pathname === '/auth';
  
  // Hide navbar on game pages and auth page for better immersion
  if (isGamePage || isAuthPage) {
    return null;
  }
  
  return <Navbar />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange={false}
    >
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Sonner 
          position="top-center"
          toastOptions={{
            duration: 4000,
            className: "mobile-safe-area",
          }}
        />
        <BrowserRouter>
          <div className="flex flex-col min-h-[100dvh] overflow-hidden bg-background">
            <main className="flex-1 overflow-auto pb-20 md:pb-0 md:pt-16 mobile-safe-area">
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
