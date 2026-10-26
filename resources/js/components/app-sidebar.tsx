import { Link, usePage } from "@inertiajs/react";
import {
    LayoutGrid,
    Moon,
    Sun,
    GraduationCap,
    UserCheck,
    BookOpen,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import type { NavItem } from "@/types";

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    const role = auth?.user?.role || "student";

    // Dynamic Navigation base sa Role
    const navItems: NavItem[] =
        role === "professor"
            ? [
                  {
                      title: "Dashboard Overview",
                      href: dashboard(),
                      icon: LayoutGrid,
                  },
                  {
                      title: "My Subjects",
                      href: "/professor/subjects",
                      icon: BookOpen,
                  },
                  {
                      title: "Grade Analytics",
                      href: "/professor/analytics",
                      icon: TrendingUp,
                  },
                  {
                      title: "At-Risk Monitoring",
                      href: "/professor/at-risk",
                      icon: AlertTriangle,
                  },
              ]
            : [
                  {
                      title: "Dashboard Overview",
                      href: dashboard(),
                      icon: LayoutGrid,
                  },
              ];

    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "dark" : "light");
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);

        if (nextTheme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 transition-colors duration-200"
        >
            {/* Header: Title Logo + Theme Toggle */}
            <SidebarHeader className="border-b border-neutral-100 dark:border-neutral-900 pb-3 group-data-[collapsible=icon]:hidden">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center justify-between gap-2 px-1 py-1">
                            {/* Logo at Title */}
                            <Link
                                href={dashboard()}
                                prefetch
                                className="flex items-center gap-3 overflow-hidden group"
                            >
                                <div className="flex size-9 items-center justify-center rounded-xl overflow-hidden bg-neutral-900 border border-teal-500/40 p-1 shrink-0 shadow-md shadow-teal-900/20 group-hover:scale-105 transition-transform duration-200">
                                    <img
                                        src="/images/logo.jpg"
                                        alt="University of Vanixx Logo"
                                        className="h-full w-full object-cover scale-125"
                                    />
                                </div>
                                <div className="flex flex-col text-left leading-tight truncate">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-black text-sm uppercase tracking-tight text-neutral-900 dark:text-white">
                                            Vanixx
                                        </span>
                                        <span className="px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-[9px] border border-teal-500/20 tracking-wider">
                                            PORTAL
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
                                        Academic Portal
                                    </span>
                                </div>
                            </Link>

                            {/* Theme Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="size-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-95"
                                title={
                                    theme === "dark"
                                        ? "Switch to Light Mode"
                                        : "Switch to Dark Mode"
                                }
                                aria-label="Toggle Theme"
                            >
                                {theme === "dark" ? (
                                    <Sun size={15} className="text-amber-400" />
                                ) : (
                                    <Moon size={15} className="text-teal-600" />
                                )}
                            </button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content: Role Badge & Navigation Links */}
            <SidebarContent className="px-2 pt-3 space-y-4 group-data-[collapsible=icon]:hidden">
                {/* Role Badge Indicator */}
                <div className="px-2 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/70 dark:border-neutral-800/60 flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
                        {role === "professor" ? (
                            <UserCheck size={14} />
                        ) : (
                            <GraduationCap size={14} />
                        )}
                    </div>
                    <div className="truncate">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500">
                            Logged in as
                        </p>
                        <p className="text-xs font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                            {role} Mode
                        </p>
                    </div>
                </div>

                {/* Main Dynamic Navigation Links */}
                <div className="space-y-1">
                    <NavMain items={navItems} />
                </div>
            </SidebarContent>

            {/* Footer: User Account */}
            <SidebarFooter className="border-t border-neutral-100 dark:border-neutral-900 pt-2 mt-auto">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
