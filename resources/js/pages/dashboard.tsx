import { Head, Link } from "@inertiajs/react";
import { useMemo } from "react";
import { dashboard } from "@/routes";
import {
    Award,
    BookMarked,
    Activity,
    CheckCircle2,
    AlertCircle,
    Users,
    TrendingUp,
    Clock,
    AlertTriangle,
    ArrowUpRight,
    GraduationCap,
    FileSpreadsheet,
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
    // Computed Analytics para sa Executive Command Center
    const analytics = useMemo(() => {
        let totalEnrollees = 0;
        let totalAssignedUnits = 0;
        let allGrades: Grade[] = [];

        subjects.forEach((sub) => {
            totalAssignedUnits += Number(sub.units || 0);
            if (sub.grades) {
                totalEnrollees += sub.grades.length;
                allGrades = [...allGrades, ...sub.grades];
            }
        });

        const encodedGrades = allGrades.filter(
            (g) => g.prelim > 0 || g.midterm > 0 || g.finals > 0,
        );

        const passedCount = encodedGrades.filter(
            (g) => g.remarks === "Passed",
        ).length;
        const atRiskCount = encodedGrades.filter(
            (g) => g.grade_point > 3.0 || g.remarks === "Failed",
        ).length;
        const honorCount = encodedGrades.filter(
            (g) => g.grade_point >= 1.0 && g.grade_point <= 1.5,
        ).length;

        const passingRate =
            encodedGrades.length > 0
                ? ((passedCount / encodedGrades.length) * 100).toFixed(1)
                : "0.0";

        const totalPossible = allGrades.length;
        const prelimDone = allGrades.filter((g) => g.prelim > 0).length;
        const midtermDone = allGrades.filter((g) => g.midterm > 0).length;
        const finalsDone = allGrades.filter((g) => g.finals > 0).length;

        return {
            totalSubjects: subjects.length,
            totalUnits: totalAssignedUnits,
            totalEnrollees,
            encodedCount: encodedGrades.length,
            passingRate,
            atRiskCount,
            honorCount,
            regularCount: Math.max(0, passedCount - honorCount),
            prelimProgress:
                totalPossible > 0
                    ? Math.round((prelimDone / totalPossible) * 100)
                    : 0,
            midtermProgress:
                totalPossible > 0
                    ? Math.round((midtermDone / totalPossible) * 100)
                    : 0,
            finalsProgress:
                totalPossible > 0
                    ? Math.round((finalsDone / totalPossible) * 100)
                    : 0,
        };
    }, [subjects]);

    return (
        <>
            <Head title="University of Vanixx - Portal Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 bg-zinc-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-full transition-colors duration-200">
                {/* Clean Section Greeting */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                            {role === "professor"
                                ? "Command Overview"
                                : "Academic Standing"}
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Welcome back,{" "}
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {auth.user.name}
                            </span>{" "}
                            • Main Campus (A.Y. 2026–2027)
                        </p>
                    </div>

                    {role === "professor" && (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/professor/subjects"
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition shadow-sm shadow-teal-900/20 active:scale-95"
                            >
                                <BookMarked size={14} />
                                <span>Manage All Subjects</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* ================= STUDENT VIEW ================= */}
                {role === "student" && (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs bg-white dark:bg-neutral-900/60">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        General Weighted Average
                                    </span>
                                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                        <Award size={18} />
                                    </div>
                                </div>
                                <div className="mt-3 text-3xl font-black text-teal-600 dark:text-teal-400">
                                    {Number(gwa).toFixed(2)}
                                </div>
                                <span className="text-[11px] text-neutral-400 mt-1 block">
                                    Standard 1.00 – 5.00 Scale
                                </span>
                            </div>

                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs bg-white dark:bg-neutral-900/60">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        Academic Load
                                    </span>
                                    <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                        <BookMarked size={18} />
                                    </div>
                                </div>
                                <div className="mt-3 text-3xl font-black text-neutral-900 dark:text-white">
                                    {totalUnits}{" "}
                                    <span className="text-sm font-semibold text-neutral-500">
                                        Units
                                    </span>
                                </div>
                                <span className="text-[11px] text-neutral-400 mt-1 block">
                                    Current Semester Load
                                </span>
                            </div>

                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs bg-white dark:bg-neutral-900/60">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        Standing Status
                                    </span>
                                    <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                        <Activity size={18} />
                                    </div>
                                </div>
                                <div className="mt-3 text-lg font-bold">
                                    {gwa > 0 && gwa <= 1.5 ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                            <CheckCircle2 size={18} /> Dean's
                                            Lister Candidate
                                        </span>
                                    ) : gwa > 3.0 ? (
                                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                            <AlertCircle size={18} /> Academic
                                            Warning
                                        </span>
                                    ) : (
                                        <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                                            <CheckCircle2 size={18} /> Regular
                                            Standing
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-neutral-400 mt-1 block">
                                    Office of Academic Records
                                </span>
                            </div>
                        </div>

                        {/* Student Grades Roster Table */}
                        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs bg-white dark:bg-neutral-900/60">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                                <FileSpreadsheet
                                    size={16}
                                    className="text-teal-600 dark:text-teal-400"
                                />
                                <span>Current Semester Grades</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4">
                                                Subject
                                            </th>
                                            <th className="py-3 px-4">
                                                Description
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Units
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Prelim
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Midterm
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Finals
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Grade Point
                                            </th>
                                            <th className="py-3 px-4 text-center">
                                                Remarks
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/60">
                                        {grades.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="py-8 text-center text-neutral-400 text-xs"
                                                >
                                                    Wala ka pang recorded na
                                                    subject ngayong semestre.
                                                </td>
                                            </tr>
                                        ) : (
                                            grades.map((grade) => (
                                                <tr
                                                    key={grade.id}
                                                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/30"
                                                >
                                                    <td className="py-3 px-4 font-bold text-teal-600 dark:text-teal-400 font-mono text-xs">
                                                        {
                                                            grade.subject
                                                                ?.subject_code
                                                        }
                                                    </td>
                                                    <td className="py-3 px-4 font-medium text-xs">
                                                        {
                                                            grade.subject
                                                                ?.subject_name
                                                        }
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-medium text-xs">
                                                        {grade.subject?.units}
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-mono text-xs">
                                                        {grade.prelim}
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-mono text-xs">
                                                        {grade.midterm}
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-mono text-xs">
                                                        {grade.finals}
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold font-mono text-xs">
                                                        {Number(
                                                            grade.grade_point,
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 text-[10px] rounded-full font-semibold border ${
                                                                grade.remarks ===
                                                                "Passed"
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                                            }`}
                                                        >
                                                            {grade.remarks}
                                                        </span>
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

                {/* ================= PROFESSOR EXECUTIVE OVERVIEW ================= */}
                {role === "professor" && (
                    <div className="space-y-6">
                        {/* 1. TOP SUMMARY METRIC CARDS */}
                        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs bg-white dark:bg-neutral-900/60">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        Assigned Load
                                    </span>
                                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                        <BookMarked size={16} />
                                    </div>
                                </div>
                                <div className="mt-2 text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                                    {analytics.totalUnits}{" "}
                                    <span className="text-xs font-semibold text-neutral-400">
                                        Units
                                    </span>
                                </div>
                                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 block">
                                    {analytics.totalSubjects} Active Classes
                                </span>
                            </div>

                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs bg-white dark:bg-neutral-900/60">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        Total Students
                                    </span>
                                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Users size={16} />
                                    </div>
                                </div>
                                <div className="mt-2 text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                                    {analytics.totalEnrollees}
                                </div>
                                <span className="text-[11px] text-neutral-400 mt-1 block">
                                    Across all assigned sections
                                </span>
                            </div>

                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs bg-white dark:bg-neutral-900/60">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        Passing Rate
                                    </span>
                                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <TrendingUp size={16} />
                                    </div>
                                </div>
                                <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                    {analytics.passingRate}%
                                </div>
                                <span className="text-[11px] text-emerald-600/80 dark:text-emerald-500 mt-1 block">
                                    Active grade average
                                </span>
                            </div>

                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs bg-white dark:bg-neutral-900/60">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        At-Risk Flags
                                    </span>
                                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                        <AlertTriangle size={16} />
                                    </div>
                                </div>
                                <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                                    {analytics.atRiskCount}
                                </div>
                                <span className="text-[11px] text-rose-500/80 mt-1 block">
                                    Requires intervention
                                </span>
                            </div>
                        </div>

                        {/* 2. MATRICES (TERM PROGRESS & GRADE SPREAD) */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Term Submission Progress */}
                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock
                                            size={16}
                                            className="text-teal-600 dark:text-teal-400"
                                        />
                                        <h3 className="text-xs font-bold uppercase tracking-wider">
                                            Term Submission Progress
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                        Timeline
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-neutral-600 dark:text-neutral-300">
                                                Prelim Term
                                            </span>
                                            <span className="text-teal-600 dark:text-teal-400 font-mono">
                                                {analytics.prelimProgress}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                            <div
                                                className="h-full bg-teal-500 rounded-full"
                                                style={{
                                                    width: `${analytics.prelimProgress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-neutral-600 dark:text-neutral-300">
                                                Midterm Term
                                            </span>
                                            <span className="text-blue-600 dark:text-blue-400 font-mono">
                                                {analytics.midtermProgress}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{
                                                    width: `${analytics.midtermProgress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-neutral-600 dark:text-neutral-300">
                                                Finals Term
                                            </span>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                                                {analytics.finalsProgress}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{
                                                    width: `${analytics.finalsProgress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Distribution Spread */}
                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80 mb-4">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap
                                            size={16}
                                            className="text-teal-600 dark:text-teal-400"
                                        />
                                        <h3 className="text-xs font-bold uppercase tracking-wider">
                                            Performance Distribution
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                        Scale
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2.5 pt-2">
                                    <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                            Honors
                                        </span>
                                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-300 mt-1">
                                            {analytics.honorCount}
                                        </div>
                                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                                            1.00 – 1.50
                                        </span>
                                    </div>

                                    <div className="p-3.5 rounded-xl border border-teal-500/20 bg-teal-500/10 text-center">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                                            Passing
                                        </span>
                                        <div className="text-xl font-black text-teal-600 dark:text-teal-300 mt-1">
                                            {analytics.regularCount}
                                        </div>
                                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                                            1.75 – 3.00
                                        </span>
                                    </div>

                                    <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-center">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                                            At-Risk
                                        </span>
                                        <div className="text-xl font-black text-rose-600 dark:text-rose-300 mt-1">
                                            {analytics.atRiskCount}
                                        </div>
                                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                                            5.00 / Below 75%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. COMPACT QUICK-ACCESS CLASSES CARD */}
                        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80 mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider">
                                    Assigned Classes Quick Access
                                </h3>
                                <Link
                                    href="/professor/subjects"
                                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                                >
                                    <span>Manage All</span>
                                    <ArrowUpRight size={13} />
                                </Link>
                            </div>

                            {subjects.length === 0 ? (
                                <p className="text-xs text-neutral-400 py-4 text-center">
                                    Walang naka-assign na klase. Pumunta sa "My
                                    Subjects" para mag-create.
                                </p>
                            ) : (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                                    {subjects.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="py-3 flex items-center justify-between gap-4 first:pt-1 last:pb-1"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                                    {sub.subject_code}
                                                </span>
                                                <div>
                                                    <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                                        {sub.subject_name}
                                                    </p>
                                                    <p className="text-[11px] text-neutral-400">
                                                        {sub.units} Units •{" "}
                                                        {sub.grades
                                                            ? sub.grades.length
                                                            : 0}{" "}
                                                        Enrolled
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/professor/subjects/${sub.id}`}
                                                className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 transition"
                                            >
                                                Open Sheet
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
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
