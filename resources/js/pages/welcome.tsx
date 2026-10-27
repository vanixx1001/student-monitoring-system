import React, { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import {
    GraduationCap,
    TrendingUp,
    Users,
    BookOpen,
    ArrowRight,
    AlertCircle,
    Award,
    FileSpreadsheet,
    UserCheck,
    Bell,
    MapPin,
    CheckCircle2,
    ChevronRight,
    ShieldCheck,
    Building2,
    Check,
    Calculator,
    FolderKanban,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface WelcomeProps {
    auth?: {
        user?: {
            id: number;
            name: string;
            role: string;
        } | null;
    };
}

// Campus Info
const vanixxCampuses = ["Main Campus"];

// Core Capabilities with Standard Icons
const features = [
    {
        icon: Users,
        title: "Student Profiling & Records",
        description:
            "Centralized repository para sa student accounts, enrolled subjects, credit units, at academic records.",
    },
    {
        icon: Calculator,
        title: "General Weighted Average (GWA) Engine",
        description:
            "Awtomatikong pagkwenta ng GWA gamit ang standard Philippine 1.00 - 5.00 point system base sa subject units.",
    },
    {
        icon: AlertCircle,
        title: "At-Risk Early Warning System",
        description:
            "Agarang pagtukoy sa mga estudyanteng may bagsak (5.00) o mababang average para sa academic intervention.",
    },
    {
        icon: BookOpen,
        title: "Subject & Unit Load Monitoring",
        description:
            "Pagsubaybay sa class rosters, credit units, at hawak na mga subject ng bawat guro at propesor.",
    },
    {
        icon: Award,
        title: "Honor Roll & Dean's List Tagger",
        description:
            "Awtomatikong filter para sa mga qualified bilang Dean's Lister Candidate (GWA 1.00 hanggang 1.50 nang walang bagsak).",
    },
    {
        icon: FileSpreadsheet,
        title: "Performance Analytics & Summaries",
        description:
            "Kumpletong breakdown ng Prelim, Midterm, at Final grade submissions bawat subject at degree program.",
    },
];

// Target Portals & System Roles
const targetUsers = [
    {
        title: "Students",
        subtitle: "Para sa mga Estudyante",
        description:
            "Tingnan ang Prelim, Midterm, at Finals grades sa bawat subject, alamin ang real-time GWA, at bantayan ang academic standing.",
        icon: GraduationCap,
        color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
        badge: "Student Portal",
        highlights: [
            "Prelim, Midterm & Finals Breakdown",
            "Auto-Computed GWA & Standing",
            "Credit Units Load Tracking",
        ],
        actionText: "Enter Student Portal",
    },
    {
        title: "Professors & Faculty",
        subtitle: "Para sa mga Propesor at Guro",
        description:
            "Mag-encode at mag-update ng scores ng mga estudyante, mamahala ng subject masterlists, at mag-enroll ng klase.",
        icon: UserCheck,
        color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700",
        badge: "Faculty Portal",
        highlights: [
            "Direct Grade Encoding Modal",
            "Automatic Raw-to-Point Conversion",
            "Class Enrollees Masterlist",
        ],
        actionText: "Enter Faculty Portal",
    },
    {
        title: "Academic Advising",
        subtitle: "Early Intervention & Guidance",
        description:
            "Proactive monitoring of students' academic progress to provide timely guidance and support before the end of the semester.",
        icon: ShieldCheck,
        color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
        badge: "Guidance & Advising",
        highlights: [
            "Failing Grade (5.00) Detection",
            "Midterm Grade Trend Analysis",
            "Proactive Academic Intervention",
        ],
        actionText: "View Retention Protocol",
    },
];

// College Program Stats Preview
const programStats = [
    {
        code: "BSIT",
        name: "College of Computer Studies",
        students: 1240,
        gwa: "1.78",
        status: "Optimal",
        statusColor:
            "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
        code: "BSBA",
        name: "College of Business Administration",
        students: 980,
        gwa: "1.92",
        status: "Good",
        statusColor:
            "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
        code: "BSCS",
        name: "College of Computer Studies",
        students: 620,
        gwa: "1.65",
        status: "Optimal",
        statusColor:
            "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
        code: "BSHM",
        name: "College of Hospitality Management",
        students: 850,
        gwa: "2.85",
        status: "Warning",
        statusColor:
            "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
];

export default function Welcome({ auth }: WelcomeProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "programs">(
        "overview",
    );
    const [isAdvisingModalOpen, setIsAdvisingModalOpen] = useState(false);

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-teal-600 selection:text-white transition-colors duration-200">
            <Head title="University of Vanixx - Academic Portal" />

            {/* Announcement Top Bar (Standard Bell Icon) */}
            <div className="bg-gradient-to-r from-teal-900 via-zinc-900 to-teal-900 dark:from-teal-950 dark:via-zinc-900 dark:to-teal-950 px-4 py-2 text-center text-xs font-medium text-teal-200 border-b border-teal-500/20 flex items-center justify-center gap-2">
                <Bell size={13} className="text-teal-400" />
                <span>
                    University Academic Portal — Prelim, Midterm, & Finals
                    Monitoring Module
                </span>
                <span className="hidden md:inline-block bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-2">
                    A.Y. 2026-2027
                </span>
            </div>

            {/* Navigation Bar */}
            <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/85 dark:bg-black/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="relative flex size-11 items-center justify-center rounded-xl overflow-hidden bg-white shadow-md border border-teal-500/30 shrink-0">
                            <img
                                src="/images/logo.jpg"
                                alt="University of Vanixx Logo"
                                className="w-full h-full object-cover scale-150"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-base font-extrabold tracking-tight leading-none text-zinc-900 dark:text-white">
                                    EduTrack
                                </p>
                                <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                    PORTAL
                                </span>
                            </div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Student Academic Performance Monitoring System
                            </p>
                        </div>
                    </div>

                    {/* Controls & Auth Links */}
                    <nav className="flex items-center gap-2 sm:gap-3">
                        <ThemeToggle />

                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="rounded-xl bg-teal-600 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-900/30 hover:bg-teal-500 transition active:scale-95"
                            >
                                Open Dashboard ({auth.user.name})
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/login"
                                    className="rounded-xl bg-teal-600 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-900/30 hover:bg-teal-500 transition hover:shadow-teal-500/40 active:scale-95"
                                >
                                    Access Portal
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-teal-500/10 dark:bg-teal-900/20 blur-[150px] rounded-full pointer-events-none" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 tracking-wide uppercase mb-6 backdrop-blur-md">
                            <Building2
                                size={14}
                                className="text-teal-600 dark:text-teal-400"
                            />
                            <span>Academic Year 2026-2027</span>
                        </div>

                        <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl">
                            Track Your Grades &{" "}
                            <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 dark:from-cyan-400 dark:via-teal-300 dark:to-white bg-clip-text text-transparent">
                                Academic Progress
                            </span>
                        </h1>

                        <p className="mt-5 text-sm sm:text-base lg:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            The centralized academic monitoring platform. Easily
                            evaluate Prelim, Midterm, and Final grades, track
                            GWA on the standard 1.00–5.00 point scale, and
                            identify at-risk performance early.
                        </p>

                        {/* Direct Login CTA */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-teal-900/20 hover:bg-teal-500 hover:scale-[1.02] active:scale-95 transition"
                            >
                                Student Portal <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-6 py-3.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition hover:text-zinc-900 dark:hover:text-white shadow-sm"
                            >
                                <UserCheck size={18} /> Faculty & Professor
                                Portal
                            </Link>
                        </div>

                        {/* Campus Pill */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <div className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-3 py-2 shadow-lg backdrop-blur-sm">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/10 ring-1 ring-teal-500/20">
                                    <MapPin
                                        size={14}
                                        className="text-teal-600 dark:text-teal-400"
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5 text-left">
                                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                                        Active Campus
                                    </span>
                                    <span className="text-xs font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
                                        Main Campus
                                    </span>
                                </div>
                                <div className="ml-2 flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Preview Dashboard */}
                    <div className="mt-12 relative max-w-5xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-3">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-red-500/80 border border-red-600/40" />
                                <div className="size-3 rounded-full bg-emerald-500/80 border border-emerald-600/40" />
                                <div className="size-3 rounded-full bg-yellow-500/80 border border-yellow-600/40" />
                                <span className="ml-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                    <ShieldCheck
                                        size={14}
                                        className="text-teal-600 dark:text-teal-400"
                                    />
                                    portal.edutrack.edu.ph/academic-record
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-zinc-500">
                                    View:
                                </span>
                                <div className="flex bg-zinc-100 dark:bg-black p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                                    <button
                                        onClick={() => setActiveTab("overview")}
                                        className={`px-3 py-1 rounded-md transition ${activeTab === "overview" ? "bg-teal-600 text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                                    >
                                        Student Grades Preview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("programs")}
                                        className={`px-3 py-1 rounded-md transition ${activeTab === "programs" ? "bg-teal-600 text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                                    >
                                        Department Analytics
                                    </button>
                                </div>
                            </div>
                        </div>

                        {activeTab === "overview" ? (
                            <div className="mt-6 space-y-6">
                                {/* Top Metrics Preview */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Enrolled Semester Load
                                        </p>
                                        <p className="mt-1 text-2xl font-black text-zinc-900 dark:text-white">
                                            9 Units
                                        </p>
                                        <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                                            Regular Status
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            General Weighted Average (GWA)
                                        </p>
                                        <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                            2.08
                                        </p>
                                        <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-500 font-medium">
                                            Standard 1.00 - 5.00 Scale
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Academic Standing
                                        </p>
                                        <p className="mt-1 text-base font-bold text-teal-600 dark:text-teal-400">
                                            Good Standing
                                        </p>
                                        <p className="mt-1 text-[11px] text-zinc-500">
                                            Passed all registered courses
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/30">
                                        <p className="text-xs text-red-600 dark:text-red-400 font-bold">
                                            At-Risk Alert Status
                                        </p>
                                        <p className="mt-1 text-base font-bold text-zinc-900 dark:text-white">
                                            Cleared
                                        </p>
                                        <p className="mt-1 text-[11px] text-red-600/80 dark:text-red-300/80">
                                            No failing marks (5.00) or INC
                                        </p>
                                    </div>
                                </div>

                                {/* Grade Table Preview */}
                                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/40 p-4 overflow-x-auto">
                                    <div className="flex items-center justify-between mb-3 min-w-[650px]">
                                        <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5">
                                            <BookOpen
                                                size={14}
                                                className="text-teal-600 dark:text-teal-400"
                                            />
                                            Standard Curriculum Grade Format
                                        </span>
                                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                                            BSIT - 1st Year (Curriculum Ref)
                                        </span>
                                    </div>
                                    <table className="w-full text-left text-xs min-w-[650px]">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                                                <th className="pb-2 font-semibold">
                                                    Subject Code
                                                </th>
                                                <th className="pb-2 font-semibold">
                                                    Subject Description
                                                </th>
                                                <th className="pb-2 font-semibold text-center">
                                                    Units
                                                </th>
                                                <th className="pb-2 font-semibold text-center">
                                                    Prelim
                                                </th>
                                                <th className="pb-2 font-semibold text-center">
                                                    Midterm
                                                </th>
                                                <th className="pb-2 font-semibold text-center">
                                                    Finals
                                                </th>
                                                <th className="pb-2 font-semibold text-center">
                                                    Point Equivalent
                                                </th>
                                                <th className="pb-2 font-semibold text-center">
                                                    Remarks
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                                            <tr>
                                                <td className="py-2.5 font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                                                    IT101
                                                </td>
                                                <td>
                                                    Introduction to Computing
                                                </td>
                                                <td className="text-center font-medium">
                                                    3
                                                </td>
                                                <td className="text-center font-mono">
                                                    92.00
                                                </td>
                                                <td className="text-center font-mono">
                                                    90.00
                                                </td>
                                                <td className="text-center font-mono">
                                                    94.00
                                                </td>
                                                <td className="text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                                    1.50
                                                </td>
                                                <td className="text-center">
                                                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-500/20">
                                                        Passed
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                                                    IT102
                                                </td>
                                                <td>Computer Programming 1</td>
                                                <td className="text-center font-medium">
                                                    3
                                                </td>
                                                <td className="text-center font-mono">
                                                    78.00
                                                </td>
                                                <td className="text-center font-mono">
                                                    75.00
                                                </td>
                                                <td className="text-center font-mono">
                                                    80.00
                                                </td>
                                                <td className="text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                                    2.75
                                                </td>
                                                <td className="text-center">
                                                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-500/20">
                                                        Passed
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                                                    MATH101
                                                </td>
                                                <td>Discrete Mathematics</td>
                                                <td className="text-center font-medium">
                                                    3
                                                </td>
                                                <td className="text-center font-mono">
                                                    88.00
                                                </td>
                                                <td className="text-center font-mono">
                                                    85.00
                                                </td>
                                                <td className="text-center font-mono">
                                                    86.00
                                                </td>
                                                <td className="text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                                    2.00
                                                </td>
                                                <td className="text-center">
                                                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-500/20">
                                                        Passed
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {programStats.map((prog) => (
                                    <div
                                        key={prog.code}
                                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-extrabold text-teal-600 dark:text-teal-400">
                                                {prog.code}
                                            </span>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${prog.statusColor}`}
                                            >
                                                {prog.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                            {prog.name}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
                                            <span className="text-zinc-500">
                                                Enrollees:{" "}
                                                <strong className="text-zinc-700 dark:text-zinc-300">
                                                    {prog.students}
                                                </strong>
                                            </span>
                                            <span className="text-zinc-500">
                                                Mean GWA:{" "}
                                                <strong className="text-zinc-900 dark:text-white">
                                                    {prog.gwa}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Target Portals Section */}
            <section className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                            Tailored Modules
                        </p>
                        <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
                            Role-Based Academic Portals
                        </h2>
                        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                            Dedicated interfaces for students to view grades and
                            professors to encode term assessments.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {targetUsers.map((user) => {
                            const Icon = user.icon;
                            return (
                                <div
                                    key={user.title}
                                    className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black p-6 hover:border-teal-500/50 transition hover:-translate-y-1 shadow-lg"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div
                                                className={`p-3 rounded-xl border ${user.color}`}
                                            >
                                                <Icon size={24} />
                                            </div>
                                            <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-300 dark:border-zinc-800">
                                                {user.badge}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                            {user.title}
                                        </h3>
                                        <p className="text-xs font-medium text-teal-600 dark:text-teal-400/90 mt-0.5">
                                            {user.subtitle}
                                        </p>
                                        <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            {user.description}
                                        </p>
                                        <ul className="mt-4 space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                                            {user.highlights.map(
                                                (item, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                                                    >
                                                        <CheckCircle2
                                                            size={14}
                                                            className="text-teal-600 dark:text-teal-500 shrink-0"
                                                        />
                                                        <span>{item}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>

                                    {user.title === "Academic Advising" ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsAdvisingModalOpen(true)
                                            }
                                            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 transition active:scale-95 cursor-pointer"
                                        >
                                            {user.actionText}{" "}
                                            <ChevronRight size={14} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition"
                                        >
                                            {user.actionText}{" "}
                                            <ChevronRight size={14} />
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Core Features Section */}
            <section className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-black py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-12">
                        <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-cyan-400">
                            Key Capabilities
                        </p>
                        <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
                            Academic Monitoring Architecture
                        </h2>
                        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                            Built specifically for semester grade tracking,
                            unit-based weights, and faculty encoding workflows.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 hover:border-teal-500/40 transition hover:-translate-y-1 group shadow-sm"
                                >
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-5 group-hover:scale-105 transition">
                                        <Icon size={22} />
                                    </div>
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Campus Network */}
            <section className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/60 dark:bg-zinc-900/30 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
                        Institutional Scope
                    </p>
                    <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
                        System Deployment
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
                        Unified database infrastructure para sa recording at
                        academic evaluation.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                        {vanixxCampuses.map((campus) => (
                            <div
                                key={campus}
                                className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-teal-500/30 hover:text-teal-600 dark:hover:text-teal-300 transition shadow-sm"
                            >
                                <MapPin
                                    size={14}
                                    className="text-teal-600 dark:text-teal-400"
                                />
                                <span>EduTrack - {campus}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom Call to Action */}
            <section className="border-t border-zinc-200 dark:border-zinc-800/80 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black py-16">
                <div className="mx-auto max-w-4xl px-4 text-center">
                    <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-4 text-teal-600 dark:text-teal-400">
                        <GraduationCap size={32} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl">
                        Access Your Academic Records
                    </h2>
                    <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-xs sm:text-base max-w-xl mx-auto">
                        Sign in gamit ang opisyal na student o professor account
                        para tingnan ang GWA standing at i-encode ang grades
                        ngayong semestre.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/login"
                            className="rounded-xl bg-teal-600 px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-teal-900/20 hover:bg-teal-500 transition active:scale-95"
                        >
                            Log In to Portal
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-black py-8 text-xs text-zinc-500">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="relative flex size-7 items-center justify-center rounded-lg overflow-hidden bg-white shadow-sm border border-teal-500/30 shrink-0">
                            <img
                                src="/images/logo.jpg"
                                alt="Vanixx Emblem"
                                className="w-full h-full object-cover scale-150"
                            />
                        </div>
                        <p>
                            © {new Date().getFullYear()} EduTrack —
                            Student Academic Performance Monitoring System.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                            <Check
                                size={14}
                                className="text-teal-600 dark:text-teal-400"
                            />{" "}
                            Academic Grading Standard Compliant
                        </span>
                    </div>
                </div>
            </footer>

            {/* Academic Advising & Intervention Protocol Modal */}
            {isAdvisingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl relative">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                            Academic Advising Protocol
                                        </h3>
                                        <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                            Intervention Module
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        EduTrack Early Warning &
                                        Retention Flow
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body / Protocols */}
                        <div className="mt-5 space-y-4 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            <p className="text-zinc-600 dark:text-zinc-400">
                                This system incorporates built-in logic to help
                                faculty advisers and guidance counselors
                                promptly identify students who may be at risk
                                before the final examinations:
                            </p>

                            <div className="space-y-3">
                                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 flex gap-3 items-start">
                                    <div className="size-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                    <div>
                                        <strong className="text-zinc-900 dark:text-white block font-semibold mb-0.5">
                                            1. Automated At-Risk Flagging
                                        </strong>
                                        The system automatically assigns an{" "}
                                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                            "At-Risk"
                                        </span>{" "}
                                        status on the student dashboard when the
                                        GWA exceeds 3.00 or a grade of 5.00 is
                                        recorded in either the Prelim or Midterm
                                        term exam.
                                    </div>
                                </div>

                                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 flex gap-3 items-start">
                                    <div className="size-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                    <div>
                                        <strong className="text-zinc-900 dark:text-white block font-semibold mb-0.5">
                                            2. Midterm Remediation Window
                                        </strong>
                                        This provides teachers and students with
                                        an opportunity to conduct remedial
                                        sessions or make-up activities during
                                        the Midterm period to help prevent a
                                        permanent failing grade in the Finals.
                                    </div>
                                </div>

                                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 flex gap-3 items-start">
                                    <div className="size-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                                    <div>
                                        <strong className="text-zinc-900 dark:text-white block font-semibold mb-0.5">
                                            3. Retention & Program Compliance
                                        </strong>
                                        The system monitors the student's total
                                        unit load to ensure curricular
                                        progression is maintained across degree
                                        programs.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setIsAdvisingModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
