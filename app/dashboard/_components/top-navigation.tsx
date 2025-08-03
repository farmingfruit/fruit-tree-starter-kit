"use client";

import clsx from "clsx";
import {
  Calendar,
  FileText,
  Heart,
  HomeIcon,
  LucideIcon,
  Menu,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserProfile from "@/components/user-profile";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface TopNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  basePath: string; // Used to determine active state for nested routes
}

const topNavItems: TopNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    basePath: "/dashboard",
  },
  {
    label: "People",
    href: "/dashboard/people",
    icon: Users,
    basePath: "/dashboard/people",
  },
  {
    label: "Giving",
    href: "/dashboard/giving/transactions",
    icon: Heart,
    basePath: "/dashboard/giving",
  },
  {
    label: "Forms",
    href: "/dashboard/forms",
    icon: FileText,
    basePath: "/dashboard/forms",
  },
  {
    label: "Groups",
    href: "/dashboard/groups",
    icon: UsersRound,
    basePath: "/dashboard/groups",
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    basePath: "/dashboard/calendar",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    basePath: "/dashboard/settings",
  },
];

export default function TopNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActiveSection = (basePath: string) => {
    if (basePath === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(basePath);
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="flex h-14 items-center px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>ChurchOS</SheetTitle>
            </SheetHeader>
            
            <nav className="flex flex-col space-y-2 mt-6">
              {topNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActiveSection(item.basePath)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex items-center space-x-4 lg:space-x-6 ml-4 md:ml-0">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 font-semibold"
          >
            <span>ChurchOS</span>
          </Link>
        </div>

        {/* Main Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 ml-6 lg:ml-8">
          {topNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActiveSection(item.basePath)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>


        {/* Right Side */}
        <div className="ml-auto flex items-center space-x-4">
          <UserProfile mini={true} />
        </div>
      </div>
    </header>
  );
}