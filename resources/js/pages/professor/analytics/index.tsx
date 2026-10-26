import { Head } from "@inertiajs/react";
import { useState, useMemo } from "react";
import {
    TrendingUp,
    Award,
    AlertTriangle,
    Users,
    GraduationCap,
    CheckCircle2,
    BarChart3,
    ArrowUpRight,
} from "lucide-react";

interface Student {
    id: number;
    name: string;
    email: string;
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
    student?: Student;
}

interface Subject {
    id: number;
    subject_code: string;
    subject_name: string;
    units: number;
    grades?: Grade[];
}

interface Props {
    auth: { user: { id: number; name: string; email: string; role: string } };
    subjects?: Subject[];
}

export default function GradeAnalytics({ subjects = [] }: Props) {
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | "all">(
        "all",
    );

    // Computed Analytics base sa selected tab
    const analytics = useMemo(() => {
        let targetGrades: (Grade & { subject_code?: string })[] = [];

        const targetSubjects =
            selectedSubjectId === "all"
                ? subjects
                : subjects.filter((s) => s.id === selectedSubjectId);

        targetSubjects.forEach((sub) => {
            if (sub.grades) {
                const mapped = sub.grades.map((g) => ({
                    ...g,
                    subject_code: sub.subject_code,
                }));
                targetGrades = [...targetGrades, ...mapped];
            }
        });

        // Tanging mga may na-encode nang grade
        const activeGrades = targetGrades.filter(
            (g) => g.prelim > 0 || g.midterm > 0 || g.finals > 0,
        );

        const totalActive = activeGrades.length;

        // Term Exam Averages
        const prelimAvg =
            totalActive > 0
                ? (
                      activeGrades.reduce(
                          (acc, curr) => acc + Number(curr.prelim || 0),
                          0,
                      ) / totalActive
                  ).toFixed(1)
                : "0.0";

        const midtermAvg =
            totalActive > 0
                ? (
                      activeGrades.reduce(
                          (acc, curr) => acc + Number(curr.midterm || 0),
                          0,
                      ) / totalActive
                  ).toFixed(1)
                : "0.0";

        const finalsAvg =
            totalActive > 0
                ? (
                      activeGrades.reduce(
                          (acc, curr) => acc + Number(curr.finals || 0),
                          0,
                      ) / totalActive
                  ).toFixed(1)
                : "0.0";

        // Grade Tier Distribution
        const honors = activeGrades.filter(
            (g) => g.grade_point >= 1.0 && g.grade_point <= 1.5,
        );
        const regular = activeGrades.filter(
            (g) => g.grade_point > 1.5 && g.grade_point <= 2.75,
        );
        const borderline = activeGrades.filter(
            (g) =>
                g.grade_point === 3.0 ||
                (g.grade_point > 2.75 && g.grade_point <= 3.0),
        );
        const failed = activeGrades.filter(
            (g) => g.grade_point > 3.0 || g.remarks === "Failed",
        );

        // Outliers: Sorted by Raw Average
        const sortedByScore = [...activeGrades].sort(
            (a, b) => Number(b.raw_average) - Number(a.raw_average),
        );

        const topPerformers = sortedByScore.slice(0, 4);
        const strugglingStudents = sortedByScore
            .filter((g) => g.grade_point > 3.0 || g.remarks === "Failed")
            .slice(0, 4);

        return {
            totalEnrolled: targetGrades.length,
            totalActive,
            prelimAvg,
            midtermAvg,
            finalsAvg,
            honorsCount: honors.length,
            regularCount: regular.length,
            borderlineCount: borderline.length,
            failedCount: failed.length,
            topPerformers,
            strugglingStudents,
        };
    }, [subjects, selectedSubjectId]);

    return (
        <>
            <Head title="Grade Analytics - University of Vanixx Portal" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 bg-zinc-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-full transition-colors duration-200">
                {/* 1. SUBJECT FILTER SELECTOR */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setSelectedSubjectId("all")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                            selectedSubjectId === "all"
                                ? "bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-900/20"
                                : "bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-teal-500/40"
                        }`}
                    >
                        All Subjects
                    </button>
                    {subjects.map((sub) => (
                        <button
                            key={sub.id}
                            type="button"
                            onClick={() => setSelectedSubjectId(sub.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                                selectedSubjectId === sub.id
                                    ? "bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-900/20"
                                    : "bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-teal-500/40"
                            }`}
                        >
                            {sub.subject_code}
                        </button>
                    ))}
                </div>

                {/* 2. TERM EXAM AVERAGES MATRIX */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                Prelim Class Average
                            </span>
                            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                <BarChart3 size={16} />
                            </div>
                        </div>
                        <div className="mt-2 text-3xl font-black text-neutral-900 dark:text-white font-mono">
                            {analytics.prelimAvg}%
                        </div>
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 block">
                            Initial Examination Benchmark
                        </span>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                Midterm Class Average
                            </span>
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <TrendingUp size={16} />
                            </div>
                        </div>
                        <div className="mt-2 text-3xl font-black text-neutral-900 dark:text-white font-mono">
                            {analytics.midtermAvg}%
                        </div>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 block">
                            Mid-Semester Evaluation
                        </span>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                Finals Class Average
                            </span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Award size={16} />
                            </div>
                        </div>
                        <div className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {analytics.finalsAvg}%
                        </div>
                        <span className="text-[11px] text-emerald-600/80 dark:text-emerald-500 font-semibold mt-1 block">
                            Final Assessment Rating
                        </span>
                    </div>
                </div>

                {/* 3. PERFORMANCE DISTRIBUTION SPREAD */}
                <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80 mb-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap
                                size={16}
                                className="text-teal-600 dark:text-teal-400"
                            />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                                Philippine Standard Grade Distribution
                            </h3>
                        </div>
                        <span className="text-xs text-neutral-400">
                            Based on {analytics.totalActive} Graded Records
                        </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Tier 1 */}
                        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                                    Honor Tier
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                    1.00 – 1.50
                                </span>
                            </div>
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-300 mt-2">
                                {analytics.honorsCount}
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                                Dean's List / Academic Scholars
                            </p>
                        </div>

                        {/* Tier 2 */}
                        <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-500/10">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-teal-700 dark:text-teal-400">
                                    Satisfactory
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300">
                                    1.75 – 2.75
                                </span>
                            </div>
                            <div className="text-3xl font-black text-teal-600 dark:text-teal-300 mt-2">
                                {analytics.regularCount}
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                                Regular Passing Competency
                            </p>
                        </div>

                        {/* Tier 3 */}
                        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-400">
                                    Borderline
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                    3.00
                                </span>
                            </div>
                            <div className="text-3xl font-black text-amber-600 dark:text-amber-300 mt-2">
                                {analytics.borderlineCount}
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                                Passing Threshold Warning
                            </p>
                        </div>

                        {/* Tier 4 */}
                        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-rose-700 dark:text-rose-400">
                                    Deficient / Fail
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300">
                                    5.00
                                </span>
                            </div>
                            <div className="text-3xl font-black text-rose-600 dark:text-rose-300 mt-2">
                                {analytics.failedCount}
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                                Academic Remediation Required
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4. PERFORMANCE OUTLIERS (TOP PERFORMERS & AT-RISK HIGHLIGHTS) */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Top Performers */}
                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80 mb-3">
                            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={16} />
                                <span>Top Academic Performers</span>
                            </div>
                            <span className="text-[11px] text-neutral-400 font-medium">
                                Rankings
                            </span>
                        </div>

                        {analytics.topPerformers.length === 0 ? (
                            <p className="text-xs text-neutral-400 py-6 text-center">
                                Wala pang sapat na records para sa rankings.
                            </p>
                        ) : (
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                                {analytics.topPerformers.map((g, idx) => (
                                    <div
                                        key={g.id}
                                        className="py-2.5 flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                                    {g.student?.name}
                                                </p>
                                                <span className="text-[10px] text-neutral-400 font-mono">
                                                    {g.subject_code}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                                {Number(g.grade_point).toFixed(
                                                    2,
                                                )}
                                            </span>
                                            <span className="text-[10px] text-neutral-400 block font-mono">
                                                {g.raw_average}% Raw
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Struggling / Lowest Performers */}
                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80 mb-3">
                            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                <AlertTriangle size={16} />
                                <span>Immediate Remediation Needed</span>
                            </div>
                            <span className="text-[11px] text-neutral-400 font-medium">
                                Critical
                            </span>
                        </div>

                        {analytics.strugglingStudents.length === 0 ? (
                            <p className="text-xs text-neutral-400 py-6 text-center">
                                Mahusay! Walang bagsak o struggling student sa
                                seleksyon na ito.
                            </p>
                        ) : (
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                                {analytics.strugglingStudents.map((g) => (
                                    <div
                                        key={g.id}
                                        className="py-2.5 flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-2 rounded-full bg-rose-500 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                                    {g.student?.name}
                                                </p>
                                                <span className="text-[10px] text-neutral-400 font-mono">
                                                    {g.subject_code}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-rose-600 dark:text-rose-400 font-mono">
                                                {Number(g.grade_point).toFixed(
                                                    2,
                                                )}
                                            </span>
                                            <span className="text-[10px] text-rose-500/80 block font-mono">
                                                {g.raw_average}% Raw
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

GradeAnalytics.layout = {
    breadcrumbs: [
        {
            title: "Grade Analytics",
            href: "/professor/analytics",
        },
    ],
};
