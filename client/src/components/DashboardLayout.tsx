import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { FileCheck2, FileText, FolderCog, LayoutDashboard, LogOut, PanelLeft, ShieldCheck, UsersRound } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { getWorkspaceNavigation } from "@shared/consultantFlow";

const menuItems = [
  { icon: LayoutDashboard, label: "Workspace", path: "/" },
  { icon: FileText, label: "Create LOA", path: "/create" },
  { icon: FileCheck2, label: "Generation history", path: "/history" },
  { icon: FolderCog, label: "Templates", path: "/templates" },
  { icon: UsersRound, label: "Access & roles", path: "/admin" },
];
const SIDEBAR_WIDTH_KEY = "loa-sidebar-width";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || 272);
  const { loading, user } = useAuth();
  useEffect(() => localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth)), [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-6"><div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-9 text-center shadow-[0_20px_70px_rgba(28,35,31,0.10)]"><div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#193d37] text-white"><ShieldCheck className="h-6 w-6" /></div><h1 className="font-serif text-3xl tracking-tight text-[#193d37]">LOA Workspace</h1><p className="mt-3 text-sm leading-6 text-stone-600">Sign in to access approved templates, reviewed generation, and document traceability.</p><Button onClick={() => startLogin()} className="mt-7 w-full bg-[#193d37] hover:bg-[#0f2c27]">Sign in</Button></div></div>;
  }

  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardContent setSidebarWidth={setSidebarWidth}>{children}</DashboardContent></SidebarProvider>;
}

function DashboardContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const initial = user?.name?.charAt(0).toUpperCase() || "U";
  const visiblePaths = getWorkspaceNavigation(user?.role);
  const visibleMenuItems = menuItems.filter(item => visiblePaths.includes(item.path));

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!resizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const width = event.clientX - left;
      if (width >= 220 && width <= 380) setSidebarWidth(width);
    };
    const stop = () => setResizing(false);
    document.addEventListener("mousemove", move); document.addEventListener("mouseup", stop);
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", stop); };
  }, [resizing, setSidebarWidth]);

  return <><div className="relative" ref={sidebarRef}><Sidebar collapsible="icon" className="border-r border-[#dfe4de] bg-[#f3f5f0]"><SidebarHeader className="h-20 px-3"><button onClick={() => setLocation("/")} className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#193d37] text-sm font-bold text-white">L</span><span className="group-data-[collapsible=icon]:hidden"><span className="block font-serif text-lg font-semibold tracking-tight text-[#193d37]">LOA Workspace</span><span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#77827d]">Authorized documents</span></span></button></SidebarHeader><SidebarContent className="pt-5"><p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#89928b] group-data-[collapsible=icon]:hidden">Workspace</p><SidebarMenu className="px-3">{visibleMenuItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-11 rounded-xl text-[#52625b] hover:bg-white hover:text-[#193d37] data-[active=true]:bg-[#193d37] data-[active=true]:text-white"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white"><Avatar className="h-9 w-9 border border-[#d5ded5]"><AvatarFallback className="bg-[#dce7df] text-xs font-semibold text-[#193d37]">{initial}</AvatarFallback></Avatar><span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><span className="block truncate text-sm font-medium text-[#233a33]">{user?.name || "Workspace user"}</span><span className="block truncate text-xs text-[#758078]">{user?.role === "admin" ? "Administrator" : "Authorized user"}</span></span></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><div onMouseDown={() => setResizing(true)} className="absolute right-0 top-0 hidden h-full w-1 cursor-col-resize hover:bg-[#82a490] md:block" /></div><SidebarInset className="bg-[#fbfbf8]">{isMobile && <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[#e4e8e3] bg-[#fbfbf8]/90 px-4 backdrop-blur"><SidebarTrigger /><span className="ml-3 font-serif text-lg font-semibold text-[#193d37]">LOA Workspace</span></header>}<main className="min-h-screen p-4 sm:p-7 lg:p-10">{children}</main></SidebarInset></>;
}
