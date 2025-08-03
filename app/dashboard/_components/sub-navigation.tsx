"use client";

import clsx from "clsx";
import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  History,
  LucideIcon,
  Settings2,
  User,
  UserPlus,
  Users,
  Plus,
  Eye,
  BarChart4,
  UserCheck,
  Zap,
  MessageSquare,
  Send,
  Inbox,
  Archive,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SubNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

interface SubNavSection {
  section: string;
  items: SubNavItem[];
}

const subNavConfig: SubNavSection[] = [
  {
    section: "people",
    items: [
      {
        label: "Directory",
        href: "/dashboard/people",
        icon: Users,
        description: "Member directory and profiles",
      },
      {
        label: "Add Member",
        href: "/dashboard/people/add",
        icon: UserPlus,
        description: "Add new church members",
      },
      {
        label: "Families",
        href: "/dashboard/people/families",
        icon: User,
        description: "Family groups and relationships",
      },
    ],
  },
  {
    section: "giving",
    items: [
      {
        label: "Transaction History",
        href: "/dashboard/giving/transactions",
        icon: History,
        description: "View all donation transactions",
      },
      {
        label: "Donation Forms",
        href: "/dashboard/giving/forms",
        icon: FileText,
        description: "Create and manage donation forms",
      },
      {
        label: "Bank Deposits",
        href: "/dashboard/giving/deposits",
        icon: Building2,
        description: "Track bank deposits and reconciliation",
      },
      {
        label: "Fund Management",
        href: "/dashboard/giving/funds",
        icon: CreditCard,
        description: "Manage designated funds and campaigns",
      },
      {
        label: "Reports",
        href: "/dashboard/giving/reports",
        icon: BarChart3,
        description: "Giving analytics and reporting",
      },
      {
        label: "Settings",
        href: "/dashboard/giving/settings",
        icon: Settings2,
        description: "Configure giving preferences",
      },
    ],
  },
  {
    section: "forms",
    items: [
      {
        label: "All Forms",
        href: "/dashboard/forms",
        icon: FileText,
        description: "View and manage all forms",
      },
      {
        label: "Create Form",
        href: "/dashboard/forms/builder",
        icon: Plus,
        description: "Build new registration or contact forms",
      },
      {
        label: "Progressive Recognition",
        href: "/dashboard/forms/demo",
        icon: Zap,
        description: "See the magic in action",
      },
      {
        label: "Admin Review Queue",
        href: "/dashboard/forms/admin-queue",
        icon: UserCheck,
        description: "Review and merge duplicate profiles",
      },
      {
        label: "Form Analytics",
        href: "/dashboard/forms/analytics",
        icon: BarChart4,
        description: "Track form performance and success rates",
      },
    ],
  },
  {
    section: "groups",
    items: [
      {
        label: "All Groups",
        href: "/dashboard/groups",
        icon: Users,
        description: "Manage church groups",
      },
    ],
  },
  {
    section: "calendar",
    items: [
      {
        label: "Events",
        href: "/dashboard/calendar",
        icon: User,
        description: "Church calendar and events",
      },
    ],
  },
  {
    section: "messaging",
    items: [
      {
        label: "Inbox",
        href: "/dashboard/messaging",
        icon: Inbox,
        description: "View messages and conversations",
      },
      {
        label: "Compose",
        href: "/dashboard/messaging/compose",
        icon: Send,
        description: "Send new email or text message",
      },
      {
        label: "Sent Messages",
        href: "/dashboard/messaging/sent",
        icon: Archive,
        description: "View messages you've sent",
      },
      {
        label: "Templates",
        href: "/dashboard/messaging/templates",
        icon: FileText,
        description: "Manage reusable message templates",
      },
      {
        label: "Keywords",
        href: "/dashboard/messaging/keywords",
        icon: Hash,
        description: "SMS automation keywords",
      },
      {
        label: "Settings",
        href: "/dashboard/messaging/settings",
        icon: Settings2,
        description: "Messaging configuration",
      },
    ],
  },
  {
    section: "settings",
    items: [
      {
        label: "General",
        href: "/dashboard/settings",
        icon: Settings2,
        description: "General church settings",
      },
    ],
  },
];

interface SubNavigationProps {
  className?: string;
}

export default function SubNavigation({ className }: SubNavigationProps) {
  const pathname = usePathname();

  // Determine current section from pathname
  const getCurrentSection = () => {
    if (pathname === "/dashboard") return null;
    
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      return pathParts[1]; // Get the section after /dashboard/
    }
    return null;
  };

  const currentSection = getCurrentSection();
  const sectionConfig = subNavConfig.find(config => config.section === currentSection);

  // Don't show sub-navigation for dashboard home or if no section config found
  if (!currentSection || !sectionConfig || currentSection === "dashboard") {
    return null;
  }

  return (
    <aside className={clsx("hidden md:flex w-64 border-r bg-background", className)}>
      <div className="flex h-full flex-col">
        {/* Section Header */}
        <div className="border-b px-4 py-3">
          <h2 className="text-lg font-semibold capitalize">{currentSection}</h2>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-4">
          {sectionConfig.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group flex flex-col gap-1 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.description && (
                <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                  {item.description}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}