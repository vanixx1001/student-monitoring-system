import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { dashboard } from "@/routes";
import {
    Award,
    BookMarked,
    Activity,
    PlusCircle,
    UserPlus,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    X,
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
    // Modals visibility state
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<{
        student_id: number;
        subject_id: number;
    } | null>(null);

    // Form para sa Grade Encoding
    const gradeForm = useForm({
        student_id: 0,
        subject_id: 0,
        prelim: 0,
        midterm: 0,
        finals: 0,
    });

    // Form para sa Pag-add ng Subject
    const subjectForm = useForm({
        subject_code: "",
        subject_name: "",
        units: 3,
    });

    // Form para sa Pag-enroll ng Estudyante
    const enrollForm = useForm({
        subject_id: subjects[0]?.id || 0,
        student_email: "",
    });

    const openGradeModal = (
        studentId: number,
        subjectId: number,
        prelim = 0,
        midterm = 0,
        finals = 0,
    ) => {
        gradeForm.setData({
            student_id: studentId,
            subject_id: subjectId,
            prelim,
            midterm,
            finals,
        });
        setSelectedGrade({ student_id: studentId, subject_id: subjectId });
    };

    const handleGradeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        gradeForm.post("/professor/grades/update", {
            onSuccess: () => {
                setSelectedGrade(null);
                gradeForm.reset();
            },
        });
    };

    const handleSubjectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        subjectForm.post("/professor/subjects/create", {
            onSuccess: () => {
                setIsSubjectModalOpen(false);
                subjectForm.reset();
            },
        });
    };

    const handleEnrollSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        enrollForm.post("/professor/subjects/enroll", {
            onSuccess: () => {
                setIsEnrollModalOpen(false);
                enrollForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="University of Vanixx - Portal Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 bg-zinc-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-screen transition-colors duration-200">
                {/* Compact Welcome & Actions Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                            Academic Overview
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Welcome back,{" "}
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {auth.user.name}
                            </span>{" "}
                            •{" "}
                            <span className="capitalize text-teal-600 dark:text-teal-400 font-bold">
                                {role}
                            </span>{" "}
                            (Main Campus)
                        </p>
                    </div>

                    {/* Professor Quick Actions */}
                    {role === "professor" && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsSubjectModalOpen(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition shadow-md shadow-teal-900/20 active:scale-95 cursor-pointer"
                            >
                                <PlusCircle size={15} />
                                <span>Create Subject</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (subjects.length > 0) {
                                        enrollForm.setData(
                                            "subject_id",
                                            subjects[0].id,
                                        );
                                    }
                                    setIsEnrollModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-95 cursor-pointer shadow-xs"
                            >
                                <UserPlus size={15} />
                                <span>Enroll Student</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* ================= STUDENT VIEW ================= */}
                {role === "student" && (
                    <div className="space-y-6">
                        {/* Summary Metrics */}
                        <div className="grid gap-4 md:grid-cols-3">
                            {/* GWA Card */}
                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs bg-white dark:bg-neutral-900/60 relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        General Weighted Average
                                    </span>
                                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                        <Award size={18} />
                                    </div>
                                </div>
                                <div className="mt-3 text-3xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
                                    {Number(gwa).toFixed(2)}
                                </div>
                                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 block">
                                    Standard 1.00 - 5.00 Scale
                                </span>
                            </div>

                            {/* Units Card */}
                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs bg-white dark:bg-neutral-900/60 relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Academic Load
                                    </span>
                                    <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                        <BookMarked size={18} />
                                    </div>
                                </div>
                                <div className="mt-3 text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                                    {totalUnits}{" "}
                                    <span className="text-sm font-semibold text-neutral-500">
                                        Units
                                    </span>
                                </div>
                                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 block">
                                    Current Semester
                                </span>
                            </div>

                            {/* Standing Card */}
                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs bg-white dark:bg-neutral-900/60 relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Academic Standing
                                    </span>
                                    <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                        <Activity size={18} />
                                    </div>
                                </div>
                                <div className="mt-3 text-xl font-bold">
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
                                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 block">
                                    Office of Academic Records
                                </span>
                            </div>
                        </div>

                        {/* Grades Table */}
                        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs bg-white dark:bg-neutral-900/60">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 font-bold text-neutral-900 dark:text-white text-sm uppercase tracking-wide">
                                <FileSpreadsheet
                                    size={16}
                                    className="text-teal-600 dark:text-teal-400"
                                />
                                <span>Enrolled Subjects & Grade Records</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-100/70 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4">
                                                Subject Code
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
                                    <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                                        {grades.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="py-10 text-center text-neutral-500 dark:text-neutral-400 text-sm"
                                                >
                                                    Wala ka pang recorded o
                                                    enrolled na subject sa
                                                    University of Vanixx portal.
                                                </td>
                                            </tr>
                                        ) : (
                                            grades.map((grade) => (
                                                <tr
                                                    key={grade.id}
                                                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/30 transition"
                                                >
                                                    <td className="py-3.5 px-4 font-bold text-teal-600 dark:text-teal-400 font-mono text-xs">
                                                        {
                                                            grade.subject
                                                                ?.subject_code
                                                        }
                                                    </td>
                                                    <td className="py-3.5 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                                                        {
                                                            grade.subject
                                                                ?.subject_name
                                                        }
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-semibold text-neutral-600 dark:text-neutral-400">
                                                        {grade.subject?.units}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono">
                                                        {grade.prelim}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono">
                                                        {grade.midterm}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono">
                                                        {grade.finals}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-neutral-900 dark:text-white font-mono">
                                                        {Number(
                                                            grade.grade_point,
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 text-xs rounded-full font-semibold border ${
                                                                grade.remarks ===
                                                                "Passed"
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
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

                {/* ================= PROFESSOR VIEW ================= */}
                {role === "professor" && (
                    <div className="space-y-6">
                        {subjects.length === 0 ? (
                            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-10 text-center text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900/60 shadow-xs">
                                Wala ka pang assigned na subject. I-click ang{" "}
                                <strong className="text-teal-600 dark:text-teal-400 font-bold">
                                    "+ Create Subject"
                                </strong>{" "}
                                sa itaas para magsimula.
                            </div>
                        ) : (
                            subjects.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs bg-white dark:bg-neutral-900/60"
                                >
                                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-teal-600 dark:text-teal-400 font-mono text-sm bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                                                {sub.subject_code}
                                            </span>
                                            <span className="text-neutral-900 dark:text-white font-bold text-sm">
                                                {sub.subject_name}
                                            </span>
                                            <span className="text-xs text-neutral-500 font-medium">
                                                ({sub.units} Units)
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                                            Roster:{" "}
                                            {sub.grades ? sub.grades.length : 0}{" "}
                                            Students
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-neutral-50/70 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-bold tracking-wider">
                                                <tr>
                                                    <th className="py-3 px-4">
                                                        Student Name
                                                    </th>
                                                    <th className="py-3 px-4">
                                                        Student Email
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
                                                        Raw Avg
                                                    </th>
                                                    <th className="py-3 px-4 text-center">
                                                        Grade Point
                                                    </th>
                                                    <th className="py-3 px-4 text-center">
                                                        Status
                                                    </th>
                                                    <th className="py-3 px-4 text-right">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                                                {sub.grades &&
                                                sub.grades.length > 0 ? (
                                                    sub.grades.map((g) => (
                                                        <tr
                                                            key={g.id}
                                                            className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/30 transition"
                                                        >
                                                            <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">
                                                                {
                                                                    g.student
                                                                        ?.name
                                                                }
                                                            </td>
                                                            <td className="py-3 px-4 text-neutral-500 text-xs font-mono">
                                                                {
                                                                    g.student
                                                                        ?.email
                                                                }
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-mono">
                                                                {g.prelim}
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-mono">
                                                                {g.midterm}
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-mono">
                                                                {g.finals}
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-medium font-mono">
                                                                {g.raw_average}%
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-bold text-neutral-900 dark:text-white font-mono">
                                                                {Number(
                                                                    g.grade_point,
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span
                                                                    className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-semibold border ${
                                                                        g.remarks ===
                                                                        "Passed"
                                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                                                                    }`}
                                                                >
                                                                    {g.remarks}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openGradeModal(
                                                                            g.student_id,
                                                                            sub.id,
                                                                            g.prelim,
                                                                            g.midterm,
                                                                            g.finals,
                                                                        )
                                                                    }
                                                                    className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg font-bold hover:bg-teal-500 transition active:scale-95 cursor-pointer shadow-xs"
                                                                >
                                                                    Encode /
                                                                    Edit
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={9}
                                                            className="py-8 text-center text-neutral-500 dark:text-neutral-400 text-sm"
                                                        >
                                                            Walang enrolled na
                                                            estudyante sa
                                                            subject na ito.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* MODAL 1: Mag-encode ng Grade */}
                {selectedGrade && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                    Encode / Update Student Grade
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setSelectedGrade(null)}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form
                                onSubmit={handleGradeSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                                        className="w-full mt-1.5 h-11 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-mono focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                                        className="w-full mt-1.5 h-11 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-mono focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                                        className="w-full mt-1.5 h-11 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-mono focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGrade(null)}
                                        className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={gradeForm.processing}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition disabled:opacity-50 cursor-pointer shadow-md shadow-teal-900/20"
                                    >
                                        {gradeForm.processing
                                            ? "Saving..."
                                            : "Save Grade"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: Gumawa ng Bagong Subject */}
                {isSubjectModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                    Create New Subject
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsSubjectModalOpen(false)}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form
                                onSubmit={handleSubjectSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Subject Code (e.g. IT201, CC103)
                                    </label>
                                    <input
                                        type="text"
                                        value={subjectForm.data.subject_code}
                                        onChange={(e) =>
                                            subjectForm.setData(
                                                "subject_code",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="IT201"
                                        className="w-full mt-1.5 h-11 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-mono uppercase focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Subject Name
                                    </label>
                                    <input
                                        type="text"
                                        value={subjectForm.data.subject_name}
                                        onChange={(e) =>
                                            subjectForm.setData(
                                                "subject_name",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Data Structures and Algorithms"
                                        className="w-full mt-1.5 h-11 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Credit Units
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="6"
                                        value={subjectForm.data.units}
                                        onChange={(e) =>
                                            subjectForm.setData(
                                                "units",
                                                parseInt(e.target.value) || 3,
                                            )
                                        }
                                        className="w-full mt-1.5 h-11 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-mono focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsSubjectModalOpen(false)
                                        }
                                        className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={subjectForm.processing}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition disabled:opacity-50 cursor-pointer shadow-md shadow-teal-900/20"
                                    >
                                        {subjectForm.processing
                                            ? "Creating..."
                                            : "Create Subject"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 3: Mag-enroll ng Estudyante */}
                {isEnrollModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                    Enroll Student to Subject
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsEnrollModalOpen(false)}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form
                                onSubmit={handleEnrollSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Select Subject
                                    </label>
                                    <select
                                        value={enrollForm.data.subject_id}
                                        onChange={(e) =>
                                            enrollForm.setData(
                                                "subject_id",
                                                parseInt(e.target.value),
                                            )
                                        }
                                        className="w-full mt-1.5 h-11 px-3 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm focus:border-teal-500 focus:outline-none"
                                    >
                                        {subjects.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.subject_code} —{" "}
                                                {sub.subject_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Student Registered Email
                                    </label>
                                    <input
                                        type="email"
                                        value={enrollForm.data.student_email}
                                        onChange={(e) =>
                                            enrollForm.setData(
                                                "student_email",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="student@example.com"
                                        className="w-full mt-1.5 h-11 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                    {enrollForm.errors.student_email && (
                                        <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">
                                            {enrollForm.errors.student_email}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEnrollModalOpen(false)
                                        }
                                        className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={enrollForm.processing}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition disabled:opacity-50 cursor-pointer shadow-md shadow-teal-900/20"
                                    >
                                        {enrollForm.processing
                                            ? "Enrolling..."
                                            : "Enroll Student"}
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

Dashboard.layout = {
    breadcrumbs: [
        {
            title: "University of Vanixx Portal",
            href: dashboard(),
        },
    ],
};
