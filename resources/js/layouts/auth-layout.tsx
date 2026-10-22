import React from "react";
import { Link } from "@inertiajs/react";
import {
    Award,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    GraduationCap,
    ArrowLeft,
} from "lucide-react";

interface AuthLayoutProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export default function AuthLayout({
    title = "",
    description = "",
    children,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-[#080b0b] text-zinc-100 selection:bg-teal-500 selection:text-white">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12">
                {/* LEFT PANEL */}
                <aside className="relative hidden overflow-hidden border-r border-white/[0.06] bg-gradient-to-br from-[#101717] via-[#0b1010] to-[#080b0b] p-10 lg:col-span-5 lg:flex lg:flex-col lg:justify-between xl:p-14">
                    {/* Background decorations */}
                    <div className="pointer-events-none absolute -left-32 top-20 size-80 rounded-full bg-teal-500/[0.07] blur-[100px]" />
                    <div className="pointer-events-none absolute -right-20 bottom-20 size-72 rounded-full bg-cyan-500/[0.05] blur-[100px]" />

                    {/* Branding - Desktop */}
                    <div className="relative z-10">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-3"
                        >
                            <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-teal-500/30 bg-white shadow-md transition duration-300 group-hover:border-teal-400/70">
                                <img
                                    src="/images/logo.jpg"
                                    alt="University of Vanixx Logo"
                                    className="w-full h-full object-cover scale-150"
                                />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-base font-extrabold leading-tight tracking-tight text-white">
                                        University of Vanixx
                                    </h1>

                                    <span className="rounded-md border border-teal-400/20 bg-teal-400/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-teal-400">
                                        PORTAL
                                    </span>
                                </div>

                                <p className="mt-1 text-xs font-medium text-zinc-400">
                                    Student Academic Performance Monitoring
                                    System
                                </p>
                            </div>
                        </Link>

                        {/* Hero */}
                        <div className="mt-16 max-w-lg space-y-6 xl:mt-20">
                            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/[0.08] px-3.5 py-2 text-xs font-semibold text-teal-300">
                                <Award size={15} />
                                Academic Year 2026–2027
                            </div>

                            <h2 className="text-4xl font-black leading-[1.15] tracking-tight text-white xl:text-5xl">
                                Your Academic Journey,
                                <span className="mt-2 block bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                    Made Clear.
                                </span>
                            </h2>

                            <p className="max-w-md text-sm leading-7 text-zinc-400 xl:text-base">
                                A unified academic portal for monitoring grades,
                                tracking performance, and supporting your
                                educational journey every step of the way.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="mt-10 space-y-4">
                            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition hover:border-teal-400/20 hover:bg-white/[0.04]">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-teal-400">
                                    <TrendingUp size={21} />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-zinc-100">
                                        Academic Performance
                                    </h3>
                                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                                        Track grades and credit-weighted
                                        averages.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.04]">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                                    <ShieldCheck size={21} />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-zinc-100">
                                        Secure Student Portal
                                    </h3>
                                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                                        Dedicated access for students and
                                        faculty.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Footer */}
                    <div className="relative z-10 mt-10 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-6">
                        <div className="flex items-center gap-2.5 text-xs text-zinc-500">
                            <GraduationCap size={16} />
                            <span>University of Vanixx</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                            System Active
                        </div>
                    </div>
                </aside>

                {/* RIGHT PANEL */}
                <main className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#080b0b] px-5 py-8 sm:px-10 lg:col-span-7 lg:px-12 xl:px-20">
                    {/* Background glow */}
                    <div className="pointer-events-none absolute right-0 top-0 size-96 rounded-full bg-teal-500/[0.035] blur-[120px]" />

                    {/* Back to Welcome Button */}
                    <div className="relative z-20 mx-auto mb-6 w-full max-w-md">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:border-teal-400/30 hover:bg-teal-400/[0.06] hover:text-teal-300"
                        >
                            <ArrowLeft
                                size={16}
                                className="transition-transform duration-200 group-hover:-translate-x-1"
                            />
                            <span>Back to Home</span>
                        </Link>
                    </div>

                    {/* Branding - Mobile */}
                    <div className="relative z-10 mx-auto mb-8 flex w-full max-w-md items-center gap-3 border-b border-white/[0.07] pb-6 lg:hidden">
                        <Link
                            href="/"
                            className="group flex min-w-0 items-center gap-3"
                        >
                            <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-teal-500/30 bg-white shadow-md transition duration-300 group-hover:border-teal-400/70">
                                <img
                                    src="/images/logo.jpg"
                                    alt="University of Vanixx Logo"
                                    className="w-full h-full object-cover scale-150"
                                />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-sm font-extrabold leading-tight tracking-tight text-white">
                                        University of Vanixx
                                    </h1>

                                    <span className="rounded-md border border-teal-400/20 bg-teal-400/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-teal-400">
                                        PORTAL
                                    </span>
                                </div>

                                <p className="mt-1 text-[10px] font-medium text-zinc-400">
                                    Student Academic Portal
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Form Content */}
                    <div className="relative z-10 mx-auto w-full max-w-md">
                        {title && (
                            <div className="mb-8 space-y-2">
                                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                    {title}
                                </h2>

                                {description && (
                                    <p className="text-sm leading-6 text-zinc-400">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}

                        {children}

                        {/* Legal Footer */}
                        <footer className="mt-10 border-t border-white/[0.07] pt-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500">
                                <span>
                                    © {new Date().getFullYear()} University of
                                    Vanixx
                                </span>

                                <span className="inline-flex items-center gap-1.5">
                                    <CheckCircle2
                                        size={13}
                                        className="text-teal-400"
                                    />
                                    Secure Academic Portal
                                </span>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}
