import { Home, FileText, CreditCard, Settings } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Header } from '@/components/header';
import NavLink from '@/components/nav-link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <NavLink href="/dashboard">
                <Home />
                <span>Dashboard</span>
              </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavLink href="/reports">
                <FileText />
                <span>Reports</span>
              </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavLink href="/billing">
                <CreditCard />
                <span>Billing</span>
              </NavLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <NavLink href="/settings">
                <Settings />
                <span>Settings</span>
              </NavLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
