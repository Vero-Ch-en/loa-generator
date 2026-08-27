import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/_core/hooks/useAuth";
import { canAccessWorkspaceRoute } from "@shared/consultantFlow";
import { ReactNode } from "react";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import CreateLoa from "./pages/CreateLoa";
import History from "./pages/History";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Templates from "./pages/Templates";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/create" component={CreateLoa} /><Route path="/history" component={() => <AdminOnly path="/history"><History /></AdminOnly>} /><Route path="/templates" component={() => <AdminOnly path="/templates"><Templates /></AdminOnly>} /><Route path="/admin" component={() => <AdminOnly path="/admin"><Admin /></AdminOnly>} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

function AdminOnly({ path, children }: { path: string; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#fbfbf8]" />;
  if (!canAccessWorkspaceRoute(user?.role, path)) return <Redirect to="/" />;
  return <>{children}</>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
