import { Breadcrumbs } from "@/components/breadcrumbs";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/types";

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { toggleSidebar, state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-950/80 px-4 sm:px-6 backdrop-blur-md transition-all duration-200">
            <div className="flex items-center gap-3.5">
                {/* Mas Malaki at Mas Prominenteng Custom Toggle Button */}
                <button
                    type="button"
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                    className="group relative flex size-9 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300 shadow-sm hover:border-teal-500/60 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200 active:scale-95 cursor-pointer ring-offset-2 hover:ring-2 hover:ring-teal-500/20"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? (
                        <PanelLeftOpen
                            size={21}
                            className="transition-transform duration-200 group-hover:scale-110"
                        />
                    ) : (
                        <PanelLeftClose
                            size={21}
                            className="transition-transform duration-200 group-hover:scale-110"
                        />
                    )}
                </button>

                {/* Vertical Divider */}
                <div className="h-5 w-[1px] bg-neutral-200 dark:bg-neutral-800" />

                {/* Breadcrumbs Navigation */}
                <div className="text-sm font-semibold tracking-wide">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* University Portal Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 shadow-xs">
                <span className="flex size-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    System Active
                </span>
            </div>
        </header>
    );
}
