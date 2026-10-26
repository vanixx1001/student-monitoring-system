import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import {
    ArrowLeft,
    UserPlus,
    FileSpreadsheet,
    Download,
    X,
    Users,
    Award,
    AlertCircle,
    CheckCircle2,
    Calendar,
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
    subject: Subject;
}

export default function SubjectShow({ auth, subject }: Props) {
    const grades = subject.grades || [];
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<{
        student_id: number;
        student_name: string;
        prelim: number;
        midterm: number;
        finals: number;
    } | null>(null);

    // Form para sa Grade Encoding
    const gradeForm = useForm({
        student_id: 0,
        subject_id: subject.id,
        prelim: 0,
        midterm: 0,
        finals: 0,
    });

    // Form para sa Student Enrollment
    const enrollForm = useForm({
        subject_id: subject.id,
        student_email: "",
    });

    const openGradeModal = (
        studentId: number,
        studentName: string,
        prelim = 0,
        midterm = 0,
        finals = 0,
    ) => {
        gradeForm.setData({
            student_id: studentId,
            subject_id: subject.id,
            prelim,
            midterm,
            finals,
        });
        setSelectedGrade({
            student_id: studentId,
            student_name: studentName,
            prelim,
            midterm,
            finals,
        });
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

    const handleEnrollSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        enrollForm.post("/professor/subjects/enroll", {
            onSuccess: () => {
                setIsEnrollModalOpen(false);
                enrollForm.reset();
            },
        });
    };

    // CSV Exporter para sa Registrar
    const exportToCSV = () => {
        if (grades.length === 0) return;

        const headers = [
            "Student Name",
            "Student Email",
            "Prelim",
            "Midterm",
            "Finals",
            "Raw Average",
            "Grade Point",
            "Remarks",
        ];

        const rows = grades.map((g) => [
            `"${g.student?.name || ""}"`,
            `"${g.student?.email || ""}"`,
            g.prelim,
            g.midterm,
            g.finals,
            g.raw_average,
            Number(g.grade_point).toFixed(2),
            `"${g.remarks}"`,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `${subject.subject_code}_Grade_Sheet_${new Date().toISOString().split("T")[0]}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Quick Stats computation
    const totalEnrollees = grades.length;
    const passedCount = grades.filter((g) => g.remarks === "Passed").length;
    const passingRate =
        totalEnrollees > 0
            ? ((passedCount / totalEnrollees) * 100).toFixed(1)
            : "0.0";

    return (
        <>
            <Head title={`${subject.subject_code} - Grade Sheet`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 bg-zinc-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-screen transition-colors duration-200">
                {/* Back Nav & Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800 gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/professor/subjects"
                            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                            title="Back to My Subjects"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                    {subject.subject_code}
                                </span>
                                <h1 className="text-xl font-black text-neutral-900 dark:text-white">
                                    {subject.subject_name}
                                </h1>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                Official Class Grading Sheet • {subject.units}{" "}
                                Academic Units
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={exportToCSV}
                            disabled={grades.length === 0}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition shadow-2xs cursor-pointer"
                        >
                            <Download size={14} />
                            <span>Export CSV</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEnrollModalOpen(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition shadow-md shadow-teal-900/20 active:scale-95 cursor-pointer"
                        >
                            <UserPlus size={14} />
                            <span>Enroll Student</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4 shadow-xs">
                        <div className="flex items-center justify-between text-neutral-500 text-xs uppercase font-bold">
                            <span>Class Roster</span>
                            <Users
                                size={16}
                                className="text-teal-600 dark:text-teal-400"
                            />
                        </div>
                        <div className="text-2xl font-black mt-2 text-neutral-900 dark:text-white">
                            {totalEnrollees}{" "}
                            <span className="text-xs font-medium text-neutral-400">
                                Enrollees
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4 shadow-xs">
                        <div className="flex items-center justify-between text-neutral-500 text-xs uppercase font-bold">
                            <span>Subject Passing Rate</span>
                            <Award
                                size={16}
                                className="text-emerald-600 dark:text-emerald-400"
                            />
                        </div>
                        <div className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
                            {passingRate}%
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4 shadow-xs col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between text-neutral-500 text-xs uppercase font-bold">
                            <span>Academic Standard</span>
                            <Calendar size={16} className="text-neutral-400" />
                        </div>
                        <div className="text-sm font-bold mt-2 text-neutral-800 dark:text-neutral-200">
                            Standard 1.00 – 5.00 Scale
                        </div>
                        <span className="text-[11px] text-neutral-400 block mt-0.5">
                            Prelim (30%) • Midterm (30%) • Finals (40%)
                        </span>
                    </div>
                </div>

                {/* Grade Table */}
                <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs bg-white dark:bg-neutral-900/60">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wide">
                            <FileSpreadsheet
                                size={16}
                                className="text-teal-600 dark:text-teal-400"
                            />
                            <span>Student Grading Sheet Masterlist</span>
                        </div>
                        <span className="text-xs text-neutral-400">
                            Showing {grades.length} Records
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50/70 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Student Name</th>
                                    <th className="py-3 px-4">Student Email</th>
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
                                        Equivalent
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
                                {grades.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="py-12 text-center text-neutral-500 dark:text-neutral-400 text-sm"
                                        >
                                            Wala pang enrolled na estudyante sa
                                            subject na ito.
                                        </td>
                                    </tr>
                                ) : (
                                    grades.map((g) => (
                                        <tr
                                            key={g.id}
                                            className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/30 transition"
                                        >
                                            <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                                                {g.student?.name}
                                            </td>
                                            <td className="py-3.5 px-4 text-neutral-500 text-xs font-mono">
                                                {g.student?.email}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono">
                                                {g.prelim}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono">
                                                {g.midterm}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono">
                                                {g.finals}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-medium font-mono">
                                                {g.raw_average}%
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-bold text-neutral-900 dark:text-white font-mono">
                                                {Number(g.grade_point).toFixed(
                                                    2,
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 text-xs rounded-full font-semibold border ${
                                                        g.remarks === "Passed"
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                                                    }`}
                                                >
                                                    {g.remarks}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openGradeModal(
                                                            g.student_id,
                                                            g.student?.name ||
                                                                "Student",
                                                            g.prelim,
                                                            g.midterm,
                                                            g.finals,
                                                        )
                                                    }
                                                    className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg font-bold hover:bg-teal-500 transition active:scale-95 cursor-pointer shadow-xs"
                                                >
                                                    Encode / Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL: Encode Grade */}
                {selectedGrade && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                        Encode Student Grade
                                    </h3>
                                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                                        {selectedGrade.student_name}
                                    </p>
                                </div>
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

                {/* MODAL: Enroll Student */}
                {isEnrollModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                    Enroll Student to {subject.subject_code}
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
