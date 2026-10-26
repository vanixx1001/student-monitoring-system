import { Head, Link, useForm } from "@inertiajs/react";
import { useState, useMemo } from "react";
import {
    AlertTriangle,
    ShieldAlert,
    AlertCircle,
    CheckCircle2,
    Mail,
    Search,
    Download,
    ArrowUpRight,
    Filter,
    Edit3,
    X,
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

export default function AtRiskMonitoring({ subjects = [] }: Props) {
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | "all">(
        "all",
    );
    const [severityFilter, setSeverityFilter] = useState<
        "all" | "critical" | "warning" | "incomplete"
    >("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Quick Grade Editing Modal state
    const [editingGrade, setEditingGrade] = useState<{
        studentId: number;
        studentName: string;
        subjectId: number;
        subjectCode: string;
        prelim: number;
        midterm: number;
        finals: number;
    } | null>(null);

    const gradeForm = useForm({
        student_id: 0,
        subject_id: 0,
        prelim: 0,
        midterm: 0,
        finals: 0,
    });

    const openEditModal = (item: {
        studentId: number;
        studentName: string;
        subjectId: number;
        subjectCode: string;
        prelim: number;
        midterm: number;
        finals: number;
    }) => {
        gradeForm.setData({
            student_id: item.studentId,
            subject_id: item.subjectId,
            prelim: item.prelim,
            midterm: item.midterm,
            finals: item.finals,
        });
        setEditingGrade(item);
    };

    const handleGradeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        gradeForm.post("/professor/grades/update", {
            onSuccess: () => {
                setEditingGrade(null);
                gradeForm.reset();
            },
        });
    };

    // Filter and Process At-Risk Records
    const processedData = useMemo(() => {
        let list: {
            id: number;
            studentId: number;
            studentName: string;
            studentEmail: string;
            subjectId: number;
            subjectCode: string;
            subjectName: string;
            prelim: number;
            midterm: number;
            finals: number;
            rawAverage: number;
            gradePoint: number;
            remarks: string;
            severity: "critical" | "warning" | "incomplete";
            triggerReason: string;
        }[] = [];

        const targetSubjects =
            selectedSubjectId === "all"
                ? subjects
                : subjects.filter((s) => s.id === selectedSubjectId);

        targetSubjects.forEach((sub) => {
            if (sub.grades) {
                sub.grades.forEach((g) => {
                    const studentName = g.student?.name || "Student Record";
                    const studentEmail =
                        g.student?.email || "No email available";
                    const p = Number(g.prelim || 0);
                    const m = Number(g.midterm || 0);
                    const f = Number(g.finals || 0);
                    const gp = Number(g.grade_point || 5.0);
                    const raw = Number(g.raw_average || 0);

                    let isRisk = false;
                    let severity: "critical" | "warning" | "incomplete" =
                        "warning";
                    let reason = "";

                    if (gp > 3.0 || g.remarks === "Failed") {
                        isRisk = true;
                        severity = "critical";
                        reason = "Failing Mark (5.00) • Raw Average Below 75%";
                    } else if (gp >= 2.75 && gp <= 3.0) {
                        isRisk = true;
                        severity = "warning";
                        reason = "Borderline Standing (2.75 - 3.00 Equivalent)";
                    } else if (
                        (p === 0 || m === 0) &&
                        (p > 0 || m > 0 || f > 0)
                    ) {
                        isRisk = true;
                        severity = "incomplete";
                        reason = "Unsubmitted Term Examination Grade";
                    }

                    if (isRisk) {
                        list.push({
                            id: g.id,
                            studentId: g.student_id,
                            studentName,
                            studentEmail,
                            subjectId: sub.id,
                            subjectCode: sub.subject_code,
                            subjectName: sub.subject_name,
                            prelim: p,
                            midterm: m,
                            finals: f,
                            rawAverage: raw,
                            gradePoint: gp,
                            remarks: g.remarks,
                            severity,
                            triggerReason: reason,
                        });
                    }
                });
            }
        });

        return list;
    }, [subjects, selectedSubjectId]);

    const criticalCount = useMemo(
        () => processedData.filter((i) => i.severity === "critical").length,
        [processedData],
    );
    const warningCount = useMemo(
        () => processedData.filter((i) => i.severity === "warning").length,
        [processedData],
    );
    const incompleteCount = useMemo(
        () => processedData.filter((i) => i.severity === "incomplete").length,
        [processedData],
    );

    const displayedRecords = useMemo(() => {
        return processedData.filter((item) => {
            const matchesSeverity =
                severityFilter === "all" || item.severity === severityFilter;
            const matchesSearch =
                item.studentName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                item.studentEmail
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                item.subjectCode
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            return matchesSeverity && matchesSearch;
        });
    }, [processedData, severityFilter, searchQuery]);

    const exportCSV = () => {
        if (displayedRecords.length === 0) return;

        const headers = [
            "Student Name",
            "Student Email",
            "Course Code",
            "Course Title",
            "Severity Status",
            "Equivalent Point",
            "Raw Weighted Average",
            "Diagnostic Reason",
        ];

        const rows = displayedRecords.map((item) => [
            `"${item.studentName}"`,
            `"${item.studentEmail}"`,
            `"${item.subjectCode}"`,
            `"${item.subjectName}"`,
            item.severity.toUpperCase(),
            Number(item.gradePoint).toFixed(2),
            `${item.rawAverage}%`,
            `"${item.triggerReason}"`,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute(
            "download",
            `Academic_Advising_Report_${new Date().toISOString().split("T")[0]}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Head title="At-Risk Academic Monitoring - University of Vanixx" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 sm:p-6 bg-zinc-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-full transition-colors duration-200">
                {/* 1. SEVERITY KPI CARDS */}
                <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-3">
                    {/* Critical */}
                    <button
                        type="button"
                        onClick={() =>
                            setSeverityFilter(
                                severityFilter === "critical"
                                    ? "all"
                                    : "critical",
                            )
                        }
                        className={`text-left p-4.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
                            severityFilter === "critical"
                                ? "bg-rose-500/15 border-rose-500/80 ring-1 ring-rose-500"
                                : "bg-white dark:bg-neutral-900/70 border-neutral-200/80 dark:border-neutral-800/90 hover:border-rose-500/40"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                Critical Severity
                            </span>
                            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                <ShieldAlert size={15} />
                            </div>
                        </div>
                        <div className="mt-1.5 text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                            {criticalCount}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                            Failing Grade (5.00) • Mandatory Remediation
                        </p>
                    </button>

                    {/* Warning */}
                    <button
                        type="button"
                        onClick={() =>
                            setSeverityFilter(
                                severityFilter === "warning"
                                    ? "all"
                                    : "warning",
                            )
                        }
                        className={`text-left p-4.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
                            severityFilter === "warning"
                                ? "bg-amber-500/15 border-amber-500/80 ring-1 ring-amber-500"
                                : "bg-white dark:bg-neutral-900/70 border-neutral-200/80 dark:border-neutral-800/90 hover:border-amber-500/40"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                Borderline Standing
                            </span>
                            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <AlertTriangle size={15} />
                            </div>
                        </div>
                        <div className="mt-1.5 text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                            {warningCount}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                            Margin: 2.75 – 3.00 • High Failure Potential
                        </p>
                    </button>

                    {/* Incomplete */}
                    <button
                        type="button"
                        onClick={() =>
                            setSeverityFilter(
                                severityFilter === "incomplete"
                                    ? "all"
                                    : "incomplete",
                            )
                        }
                        className={`text-left p-4.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
                            severityFilter === "incomplete"
                                ? "bg-neutral-200 dark:bg-neutral-800 border-neutral-400 ring-1 ring-neutral-400"
                                : "bg-white dark:bg-neutral-900/70 border-neutral-200/80 dark:border-neutral-800/90 hover:border-neutral-400/40"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                Incomplete Records
                            </span>
                            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                <AlertCircle size={15} />
                            </div>
                        </div>
                        <div className="mt-1.5 text-3xl font-black text-neutral-900 dark:text-white font-mono">
                            {incompleteCount}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                            Unsubmitted Term Examination Scores
                        </p>
                    </button>
                </div>

                {/* 2. FILTER TABS & SEARCH ACTION BAR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Class Filter Badges */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => setSelectedSubjectId("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                                selectedSubjectId === "all"
                                    ? "bg-teal-600 text-white border-teal-600 shadow-xs shadow-teal-900/20"
                                    : "bg-white dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-teal-500/40"
                            }`}
                        >
                            All Assigned Classes
                        </button>
                        {subjects.map((sub) => (
                            <button
                                key={sub.id}
                                type="button"
                                onClick={() => setSelectedSubjectId(sub.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                                    selectedSubjectId === sub.id
                                        ? "bg-teal-600 text-white border-teal-600 shadow-xs shadow-teal-900/20"
                                        : "bg-white dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-teal-500/40"
                                }`}
                            >
                                {sub.subject_code}
                            </button>
                        ))}
                    </div>

                    {/* Search Field & Export Button */}
                    <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by student name or code..."
                                className="w-full h-9 pl-9.5 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-teal-500 focus:outline-none transition shadow-2xs"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={exportCSV}
                            disabled={displayedRecords.length === 0}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition shadow-2xs cursor-pointer shrink-0"
                        >
                            <Download size={13} />
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>

                {/* 3. ADVISING MASTERLIST DATA TABLE */}
                <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/90 overflow-hidden shadow-xs bg-white dark:bg-neutral-900/70">
                    <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter
                                size={15}
                                className="text-teal-600 dark:text-teal-400"
                            />
                            <span className="font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                                Academic Advising Masterlist
                            </span>
                        </div>
                        <span className="text-[11px] font-semibold text-neutral-400">
                            Showing {displayedRecords.length} Flagged Case(s)
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50/80 dark:bg-neutral-900/60 text-neutral-500 dark:text-neutral-400 text-[11px] uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">
                                        Student Profile
                                    </th>
                                    <th className="py-3 px-4">Subject</th>
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
                                        Raw Avg
                                    </th>
                                    <th className="py-3 px-4 text-center">
                                        Grade Point
                                    </th>
                                    <th className="py-3 px-4">
                                        Risk Severity & Diagnosis
                                    </th>
                                    <th className="py-3 px-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                                {displayedRecords.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="py-14 text-center text-neutral-500 dark:text-neutral-400"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                                                    <CheckCircle2 size={22} />
                                                </div>
                                                <p className="font-bold text-neutral-900 dark:text-white text-sm">
                                                    No At-Risk Records Detected
                                                </p>
                                                <p className="text-xs text-neutral-400 mt-0.5 max-w-sm">
                                                    All students under the
                                                    current filter criteria meet
                                                    university passing
                                                    thresholds.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    displayedRecords.map((item) => {
                                        const initials = item.studentName
                                            .split(" ")
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join("");

                                        return (
                                            <tr
                                                key={`${item.subjectId}-${item.studentId}`}
                                                className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition"
                                            >
                                                {/* Profile */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                                            {initials || "ST"}
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="font-bold text-neutral-900 dark:text-white text-xs">
                                                                {
                                                                    item.studentName
                                                                }
                                                            </p>
                                                            <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
                                                                <Mail
                                                                    size={11}
                                                                />
                                                                {
                                                                    item.studentEmail
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Subject */}
                                                <td className="py-3.5 px-4">
                                                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                                        {item.subjectCode}
                                                    </span>
                                                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1 max-w-[160px]">
                                                        {item.subjectName}
                                                    </p>
                                                </td>

                                                {/* Scores */}
                                                <td className="py-3.5 px-4 text-center font-mono text-xs">
                                                    {item.prelim}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-mono text-xs">
                                                    {item.midterm}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-mono text-xs">
                                                    {item.finals}
                                                </td>

                                                {/* Raw Avg */}
                                                <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold">
                                                    {item.rawAverage}%
                                                </td>

                                                {/* Grade Point */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <span
                                                        className={`font-mono text-xs font-black ${
                                                            item.gradePoint >
                                                            3.0
                                                                ? "text-rose-600 dark:text-rose-400"
                                                                : "text-amber-600 dark:text-amber-400"
                                                        }`}
                                                    >
                                                        {Number(
                                                            item.gradePoint,
                                                        ).toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Diagnosis */}
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 text-[9px] rounded-md font-bold uppercase tracking-wider border ${
                                                            item.severity ===
                                                            "critical"
                                                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                                                                : item.severity ===
                                                                    "warning"
                                                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
                                                                  : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/25"
                                                        }`}
                                                    >
                                                        {item.severity}
                                                    </span>
                                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs leading-snug">
                                                        {item.triggerReason}
                                                    </p>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    item,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition shadow-2xs active:scale-95 cursor-pointer"
                                                            title="Directly edit student grade"
                                                        >
                                                            <Edit3 size={12} />
                                                            <span>Encode</span>
                                                        </button>

                                                        <Link
                                                            href={`/professor/subjects/${item.subjectId}`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition active:scale-95 cursor-pointer"
                                                            title="Open full class grade sheet"
                                                        >
                                                            <span>Sheet</span>
                                                            <ArrowUpRight
                                                                size={12}
                                                            />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL: DIRECT GRADE ENCODING */}
                {editingGrade && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                        Update Student Grade
                                    </h3>
                                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                                        {editingGrade.studentName} (
                                        {editingGrade.subjectCode})
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingGrade(null)}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleGradeSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Prelim Score (0-100)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={gradeForm.data.prelim}
                                        onChange={(e) =>
                                            gradeForm.setData(
                                                "prelim",
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        className="w-full mt-1.5 h-10 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-mono focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Midterm Score (0-100)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={gradeForm.data.midterm}
                                        onChange={(e) =>
                                            gradeForm.setData(
                                                "midterm",
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        className="w-full mt-1.5 h-10 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-mono focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Finals Score (0-100)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={gradeForm.data.finals}
                                        onChange={(e) =>
                                            gradeForm.setData(
                                                "finals",
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        className="w-full mt-1.5 h-10 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-mono focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setEditingGrade(null)}
                                        className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={gradeForm.processing}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition disabled:opacity-50 cursor-pointer shadow-xs shadow-teal-900/20"
                                    >
                                        {gradeForm.processing
                                            ? "Updating..."
                                            : "Save Grade"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

AtRiskMonitoring.layout = {
    breadcrumbs: [
        {
            title: "At-Risk Monitoring",
            href: "/professor/at-risk",
        },
    ],
};
