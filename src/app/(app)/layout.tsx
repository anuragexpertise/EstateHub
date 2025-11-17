import { SidebarNav } from '@/components/app/sidebar-nav';
import { UserNav } from '@/components/app/user-nav';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft } from 'lucide-react';
import { SidebarNavHeader } from '@/components/app/sidebar-nav-header';
import { DateTimeDisplay } from '@/components/app/date-time-display';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <a
            href="#"
            className="hidden items-center gap-2 font-bold font-headline sm:flex"
          >
            <Logo className="h-6 w-6 text-primary" />
            <span>EstateHub</span>
          </a>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <a
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">EstateHub</span>
                </a>
                <SidebarNav isMobile={true} />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex justify-center items-center gap-4">
            <SidebarNavHeader />
            <DateTimeDisplay />
          </div>

          <div className="relative ml-auto flex-none">
            <UserNav />
          </div>
        </header>
        <div className="flex flex-1">
            <aside className="hidden w-60 flex-col border-r bg-background sm:flex">
                <SidebarNav />
            </aside>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                {children}
            </main>
        </div>
    </div>
  );
}
