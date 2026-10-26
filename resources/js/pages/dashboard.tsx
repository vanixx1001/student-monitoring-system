import { Head, Link } from "@inertiajs/react";
import { useMemo } from "react";
import { dashboard } from "@/routes";
import {
    Award,
    BookMarked,
    Users,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    GraduationCap,
    BarChart3,
    Table,
} from "lucide-react";

interface Subject {
    id: number;
    subject_code: string;
    subject_name: string;
    units: number;
    grades?: Grade[];
}

interface Grade {
    id: number;
    student_id: number;
    subject_id: number;
    prelim: number;
    midterm: number;
    finals: number;
    raw_average: number;
    grade_point: number;
    remarks: string;
    subject?: Subject;
    student?: {
        id: number;
        name: string;
        email: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Props {
    auth: { user: User };
    role: "professor" | "student";
    grades?: Grade[];
    subjects?: Subject[];
    gwa?: number;
    totalUnits?: number;
}

export default function Dashboard({
    auth,
    role,
    grades = [],
    subjects = [],
    gwa = 0,
    totalUnits = 0,
}: Props) {
    // Computed Overview & Matrix Analytics
    const stats = useMemo(() => {
        let totalStudents = 0;
        let totalUnitsCount = 0;
        let allGrades: Grade[] = [];

        // Per-Subject Matrix Breakdown
        const subjectMatrix = subjects.map((sub) => {
            const subGrades = sub.grades || [];
            const count = subGrades.length;
            totalStudents += count;
            totalUnitsCount += Number(sub.units || 0);
            allGrades = [...allGrades, ...subGrades];

            const activeSubGrades = subGrades.filter(
                (g) => g.prelim > 0 || g.midterm > 0 || g.finals > 0,
            );

            const prelimSum = activeSubGrades.reduce(
                (acc, curr) => acc + Number(curr.prelim || 0),
                0,
            );
            const midtermSum = activeSubGrades.reduce(
                (acc, curr) => acc + Number(curr.midterm || 0),
                0,
            );
            const finalsSum = activeSubGrades.reduce(
                (acc, curr) => acc + Number(curr.finals || 0),
                0,
            );

            const activeCount = activeSubGrades.length;
            const passedCount = activeSubGrades.filter(
                (g) => g.remarks === "Passed",
            ).length;

            return {
                id: sub.id,
                code: sub.subject_code,
                name: sub.subject_name,
                units: sub.units,
                enrollees: count,
                activeGradesCount: activeCount,
                prelimMean:
                    activeCount > 0
                        ? (prelimSum / activeCount).toFixed(1)
                        : "0.0",
                midtermMean:
                    activeCount > 0
                        ? (midtermSum / activeCount).toFixed(1)
                        : "0.0",
                finalsMean:
                    activeCount > 0
                        ? (finalsSum / activeCount).toFixed(1)
                        : "0.0",
                passingRate:
                    activeCount > 0
                        ? Math.round((passedCount / activeCount) * 100)
                        : 0,
                atRiskCount: activeSubGrades.filter(
                    (g) => g.grade_point > 3.0 || g.remarks === "Failed",
                ).length,
            };
        });

        // Global Grade Distribution Matrix
        const graded = allGrades.filter(
            (g) => g.prelim > 0 || g.midterm > 0 || g.finals > 0,
        );
        const totalGraded = graded.length;

        const honors = graded.filter(
            (g) => g.grade_point >= 1.0 && g.grade_point <= 1.5,
        ).length;
        const good = graded.filter(
            (g) => g.grade_point > 1.5 && g.grade_point <= 2.5,
        ).length;
        const passing = graded.filter(
            (g) => g.grade_point > 2.5 && g.grade_point <= 3.0,
        ).length;
        const deficient = graded.filter(
            (g) => g.grade_point > 3.0 || g.remarks === "Failed",
        ).length;

        const passedTotal = honors + good + passing;
        const globalPassingRate =
            totalGraded > 0 ? Math.round((passedTotal / totalGraded) * 100) : 0;

        const prelimEncoded = allGrades.filter((g) => g.prelim > 0).length;
        const midtermEncoded = allGrades.filter((g) => g.midterm > 0).length;
        const finalsEncoded = allGrades.filter((g) => g.finals > 0).length;

        return {
            totalSubjects: subjects.length,
            totalUnits: totalUnitsCount,
            totalStudents,
            totalGraded,
            globalPassingRate,
            deficient,
            honors,
            good,
            passing,
            honorsPct:
                totalGraded > 0 ? Math.round((honors / totalGraded) * 100) : 0,
            goodPct:
                totalGraded > 0 ? Math.round((good / totalGraded) * 100) : 0,
            passingPct:
                totalGraded > 0 ? Math.round((passing / totalGraded) * 100) : 0,
            deficientPct:
                totalGraded > 0
                    ? Math.round((deficient / totalGraded) * 100)
                    : 0,
            prelimProgress:
                allGrades.length > 0
                    ? Math.round((prelimEncoded / allGrades.length) * 100)
                    : 0,
            midtermProgress:
                allGrades.length > 0
                    ? Math.round((midtermEncoded / allGrades.length) * 100)
                    : 0,
            finalsProgress:
                allGrades.length > 0
                    ? Math.round((finalsEncoded / allGrades.length) * 100)
                    : 0,
            subjectMatrix,
        };
    }, [subjects]);

    return (
        <>
            <Head title="Executive Dashboard - University of Vanixx Portal" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 bg-zinc-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-full transition-colors duration-200">
                {/* 1. WELCOME HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-neutral-200/80 dark:border-neutral-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                                Academic Command Center
                            </h2>
                            <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono text-[10px] font-bold border border-teal-500/20">
                                AY 2026–2027
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Welcome back, Prof. {auth.user.name} • Monitoring
                            portal for enrolled courses and grading metrics.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/professor/subjects"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-sm shadow-teal-900/20 active:scale-95"
                        >
                            <BookMarked size={14} />
                            <span>My Subjects</span>
                        </Link>
                    </div>
                </div>

                {/* ================= PROFESSOR PORTAL OVERVIEW ================= */}
                {role === "professor" && (
                    <div className="space-y-6">
                        {/* 2. TOP METRIC TILES */}
                        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        Assigned Load
                                    </span>
                                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                        <BookMarked size={16} />
                                    </div>
                                </div>
                                <div className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">
                                    {stats.totalUnits}{" "}
                                    <span className="text-xs font-semibold text-neutral-400">
                                        Units
                                    </span>
                                </div>
                                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 block">
                                    {stats.totalSubjects} Active Sections
                                </span>
                            </div>

                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        Enrolled Students
                                    </span>
                                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Users size={16} />
                                    </div>
                                </div>
                                <div className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">
                                    {stats.totalStudents}
                                </div>
                                <span className="text-[11px] text-neutral-400 mt-1 block">
                                    Total class population
                                </span>
                            </div>

                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        Overall Passing Rate
                                    </span>
                                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <TrendingUp size={16} />
                                    </div>
                                </div>
                                <div className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                    {stats.globalPassingRate}%
                                </div>
                                <span className="text-[11px] text-emerald-600/80 dark:text-emerald-500 mt-1 block">
                                    Equivalent 1.00 – 3.00
                                </span>
                            </div>

                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        At-Risk Interventions
                                    </span>
                                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                        <AlertTriangle size={16} />
                                    </div>
                                </div>
                                <div className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
                                    {stats.deficient}
                                </div>
                                <span className="text-[11px] text-rose-500/80 mt-1 block">
                                    Grade 5.00 / Below 75%
                                </span>
                            </div>
                        </div>

                        {/* 3. PERFORMANCE MATRIX & EXAM TIMELINE */}
                        <div className="grid gap-4 lg:grid-cols-3">
                            {/* Academic Performance Distribution Matrix (2 Cols) */}
                            <div className="lg:col-span-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Table
                                            size={16}
                                            className="text-teal-600 dark:text-teal-400"
                                        />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                                            Academic Standing Distribution
                                            Matrix
                                        </h3>
                                    </div>
                                    <span className="text-[11px] text-neutral-400 font-mono">
                                        {stats.totalGraded} Graded Records
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {/* Honors */}
                                    <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                                        <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block tracking-wider">
                                            Dean's Honors
                                        </span>
                                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300 mt-1 font-mono">
                                            {stats.honors}
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1 border-t border-emerald-500/20 pt-1">
                                            <span>Scale: 1.00–1.50</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {stats.honorsPct}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Good Standing */}
                                    <div className="p-3.5 rounded-xl border border-teal-500/20 bg-teal-500/10">
                                        <span className="text-[10px] font-bold uppercase text-teal-700 dark:text-teal-400 block tracking-wider">
                                            Good Standing
                                        </span>
                                        <div className="text-2xl font-black text-teal-600 dark:text-teal-300 mt-1 font-mono">
                                            {stats.good}
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1 border-t border-teal-500/20 pt-1">
                                            <span>Scale: 1.75–2.50</span>
                                            <span className="font-bold text-teal-600 dark:text-teal-400">
                                                {stats.goodPct}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Passing Margin */}
                                    <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10">
                                        <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block tracking-wider">
                                            Passing Margin
                                        </span>
                                        <div className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-1 font-mono">
                                            {stats.passing}
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1 border-t border-amber-500/20 pt-1">
                                            <span>Scale: 2.75–3.00</span>
                                            <span className="font-bold text-amber-600 dark:text-amber-400">
                                                {stats.passingPct}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Deficient */}
                                    <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10">
                                        <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 block tracking-wider">
                                            Deficient / Fail
                                        </span>
                                        <div className="text-2xl font-black text-rose-600 dark:text-rose-300 mt-1 font-mono">
                                            {stats.deficient}
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1 border-t border-rose-500/20 pt-1">
                                            <span>Scale: 5.00</span>
                                            <span className="font-bold text-rose-600 dark:text-rose-400">
                                                {stats.deficientPct}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Examination Term Encoding Progress (1 Col) */}
                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Clock
                                                size={16}
                                                className="text-teal-600 dark:text-teal-400"
                                            />
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                                                Exam Encoding Status
                                            </h3>
                                        </div>
                                        <span className="text-[10px] text-neutral-400 font-semibold uppercase">
                                            Milestones
                                        </span>
                                    </div>

                                    <div className="space-y-3.5">
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-neutral-600 dark:text-neutral-300">
                                                    Prelim Term
                                                </span>
                                                <span className="text-teal-600 dark:text-teal-400 font-mono text-[11px]">
                                                    {stats.prelimProgress}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-500 rounded-full"
                                                    style={{
                                                        width: `${stats.prelimProgress}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-neutral-600 dark:text-neutral-300">
                                                    Midterm Term
                                                </span>
                                                <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                                                    {stats.midtermProgress}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{
                                                        width: `${stats.midtermProgress}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-neutral-600 dark:text-neutral-300">
                                                    Final Term
                                                </span>
                                                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                                                    {stats.finalsProgress}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{
                                                        width: `${stats.finalsProgress}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                                    <span className="text-neutral-400">
                                        Need academic counseling?
                                    </span>
                                    <Link
                                        href="/professor/at-risk"
                                        className="text-teal-600 dark:text-teal-400 font-bold hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>At-Risk List</span>
                                        <ArrowUpRight size={13} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* 4. PER-SUBJECT DIAGNOSTIC & COMPETENCY MATRIX TABLE */}
                        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs bg-white dark:bg-neutral-900/60">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                                    <BarChart3
                                        size={16}
                                        className="text-teal-600 dark:text-teal-400"
                                    />
                                    <span>
                                        Course Competency & Term Score Matrix
                                    </span>
                                </div>
                                <span className="text-[11px] text-neutral-400">
                                    {stats.subjectMatrix.length} Section(s)
                                    Monitored
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50/70 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 text-[11px] uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4">
                                                Subject Information
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Units
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Class Roster
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Prelim Mean
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Midterm Mean
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Finals Mean
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Passing Rate
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                At-Risk
                                            </th>
                                            <th className="py-3 px-4 text-right">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                                        {stats.subjectMatrix.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={9}
                                                    className="py-10 text-center text-neutral-400 text-xs"
                                                >
                                                    No courses currently
                                                    assigned. Click "My
                                                    Subjects" to create one.
                                                </td>
                                            </tr>
                                        ) : (
                                            stats.subjectMatrix.map((sub) => (
                                                <tr
                                                    key={sub.id}
                                                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/30 transition"
                                                >
                                                    {/* Subject Info */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                                                {sub.code}
                                                            </span>
                                                            <span className="font-bold text-neutral-900 dark:text-white text-xs truncate max-w-xs">
                                                                {sub.name}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                                                        {sub.units}
                                                    </td>

                                                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                                                        {sub.enrollees}
                                                    </td>

                                                    {/* Term Means */}
                                                    <td className="py-3.5 px-4 text-center font-mono text-xs text-neutral-600 dark:text-neutral-300">
                                                        {sub.prelimMean}%
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono text-xs text-neutral-600 dark:text-neutral-300">
                                                        {sub.midtermMean}%
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono text-xs text-neutral-600 dark:text-neutral-300">
                                                        {sub.finalsMean}%
                                                    </td>

                                                    {/* Passing Rate */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span
                                                            className={`font-mono text-xs font-bold ${
                                                                sub.passingRate >=
                                                                75
                                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                                    : "text-amber-600 dark:text-amber-400"
                                                            }`}
                                                        >
                                                            {sub.passingRate}%
                                                        </span>
                                                    </td>

                                                    {/* At-Risk Count */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        {sub.atRiskCount > 0 ? (
                                                            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                                                                {
                                                                    sub.atRiskCount
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-neutral-400 text-xs">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Action */}
                                                    <td className="py-3.5 px-4 text-right">
                                                        <Link
                                                            href={`/professor/subjects/${sub.id}`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 transition"
                                                        >
                                                            <span>
                                                                Open Sheet
                                                            </span>
                                                            <ArrowUpRight
                                                                size={12}
                                                            />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: "Dashboard Overview",
            href: dashboard(),
        },
    ],
};
