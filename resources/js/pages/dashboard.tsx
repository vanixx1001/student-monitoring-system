import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { dashboard } from "@/routes";
import { GraduationCap } from "lucide-react";

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

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* School Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-5 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl overflow-hidden bg-neutral-900 border border-teal-500/30 p-1 shadow-lg shadow-teal-900/30">
                            <img
                                src="/images/logo.jpg"
                                alt="University of Vanixx Logo"
                                className="w-full h-full object-cover scale-150"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black tracking-tight text-white uppercase">
                                    University of Vanixx
                                </h1>
                                <span className="rounded bg-teal-400/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-400/20">
                                    PORTAL
                                </span>
                            </div>
                            <p className="text-xs text-neutral-400 mt-0.5">
                                Welcome,{" "}
                                <strong className="text-neutral-200">
                                    {auth.user.name}
                                </strong>{" "}
                                • Role:{" "}
                                <span className="capitalize font-semibold text-teal-400">
                                    {role}
                                </span>{" "}
                                (Main Campus)
                            </p>
                        </div>
                    </div>

                    {/* Professor Action Buttons */}
                    {role === "professor" && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsSubjectModalOpen(true)}
                                className="px-3.5 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition shadow-md shadow-teal-900/30"
                            >
                                + Create Subject
                            </button>
                            <button
                                onClick={() => {
                                    if (subjects.length > 0) {
                                        enrollForm.setData(
                                            "subject_id",
                                            subjects[0].id,
                                        );
                                    }
                                    setIsEnrollModalOpen(true);
                                }}
                                className="px-3.5 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-200 text-xs font-bold hover:bg-neutral-800 transition"
                            >
                                + Enroll Student
                            </button>
                        </div>
                    )}
                </div>

                {/* ================= STUDENT VIEW ================= */}
                {role === "student" && (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-neutral-800 p-5 shadow-sm bg-neutral-950">
                                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    General Weighted Average (GWA)
                                </span>
                                <div className="mt-2 text-3xl font-black text-teal-400">
                                    {Number(gwa).toFixed(2)}
                                </div>
                                <span className="text-[11px] text-neutral-500">
                                    Standard 1.00 - 5.00 Scale
                                </span>
                            </div>

                            <div className="rounded-xl border border-neutral-800 p-5 shadow-sm bg-neutral-950">
                                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Enrolled Academic Load
                                </span>
                                <div className="mt-2 text-3xl font-black text-white">
                                    {totalUnits} Units
                                </div>
                                <span className="text-[11px] text-neutral-500">
                                    Current Semester
                                </span>
                            </div>

                            <div className="rounded-xl border border-neutral-800 p-5 shadow-sm bg-neutral-950">
                                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Academic Standing
                                </span>
                                <div className="mt-2 text-xl font-bold">
                                    {gwa > 0 && gwa <= 1.5 ? (
                                        <span className="text-emerald-400">
                                            Dean's Lister Candidate
                                        </span>
                                    ) : gwa > 3.0 ? (
                                        <span className="text-rose-400">
                                            At-Risk / Academic Warning
                                        </span>
                                    ) : (
                                        <span className="text-teal-400">
                                            Good Standing
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-neutral-500">
                                    Office of Academic Records
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-neutral-800 overflow-hidden shadow-sm bg-neutral-950">
                            <div className="p-4 border-b border-neutral-800 font-bold text-white text-base">
                                Enrolled Subjects & Grade Records
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-900/80 text-neutral-400 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="p-3">
                                                Subject Code
                                            </th>
                                            <th className="p-3">Description</th>
                                            <th className="p-3">Units</th>
                                            <th className="p-3">Prelim</th>
                                            <th className="p-3">Midterm</th>
                                            <th className="p-3">Finals</th>
                                            <th className="p-3">Equivalent</th>
                                            <th className="p-3">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                                        {grades.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="p-4 text-center text-neutral-500"
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
                                                    className="hover:bg-neutral-900/40"
                                                >
                                                    <td className="p-3 font-semibold text-teal-400 font-mono">
                                                        {
                                                            grade.subject
                                                                ?.subject_code
                                                        }
                                                    </td>
                                                    <td className="p-3">
                                                        {
                                                            grade.subject
                                                                ?.subject_name
                                                        }
                                                    </td>
                                                    <td className="p-3">
                                                        {grade.subject?.units}
                                                    </td>
                                                    <td className="p-3">
                                                        {grade.prelim}
                                                    </td>
                                                    <td className="p-3">
                                                        {grade.midterm}
                                                    </td>
                                                    <td className="p-3">
                                                        {grade.finals}
                                                    </td>
                                                    <td className="p-3 font-bold text-white">
                                                        {Number(
                                                            grade.grade_point,
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2.5 py-1 text-xs rounded-full font-semibold border ${
                                                                grade.remarks ===
                                                                "Passed"
                                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
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
                            <div className="rounded-xl border border-neutral-800 p-8 text-center text-neutral-500 bg-neutral-950">
                                Wala ka pang assigned na subject. I-click ang{" "}
                                <strong>"+ Create Subject"</strong> sa itaas
                                para magsimula.
                            </div>
                        ) : (
                            subjects.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="rounded-xl border border-neutral-800 overflow-hidden shadow-sm bg-neutral-950"
                                >
                                    <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex justify-between items-center">
                                        <div>
                                            <span className="font-bold text-teal-400 font-mono">
                                                {sub.subject_code}
                                            </span>{" "}
                                            -{" "}
                                            <span className="text-white font-medium">
                                                {sub.subject_name}
                                            </span>
                                            <span className="ml-2 text-xs text-neutral-500">
                                                ({sub.units} Units)
                                            </span>
                                        </div>
                                        <span className="text-xs text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
                                            Roster:{" "}
                                            {sub.grades ? sub.grades.length : 0}{" "}
                                            Enrollees
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-neutral-900/40 text-neutral-400 text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-3">
                                                        Student Name
                                                    </th>
                                                    <th className="p-3">
                                                        Student Email
                                                    </th>
                                                    <th className="p-3">
                                                        Prelim
                                                    </th>
                                                    <th className="p-3">
                                                        Midterm
                                                    </th>
                                                    <th className="p-3">
                                                        Finals
                                                    </th>
                                                    <th className="p-3">
                                                        Raw Avg
                                                    </th>
                                                    <th className="p-3">
                                                        Grade Point
                                                    </th>
                                                    <th className="p-3">
                                                        Status
                                                    </th>
                                                    <th className="p-3 text-right">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                                                {sub.grades &&
                                                sub.grades.length > 0 ? (
                                                    sub.grades.map((g) => (
                                                        <tr
                                                            key={g.id}
                                                            className="hover:bg-neutral-900/30"
                                                        >
                                                            <td className="p-3 font-semibold text-white">
                                                                {
                                                                    g.student
                                                                        ?.name
                                                                }
                                                            </td>
                                                            <td className="p-3 text-neutral-500 text-xs font-mono">
                                                                {
                                                                    g.student
                                                                        ?.email
                                                                }
                                                            </td>
                                                            <td className="p-3">
                                                                {g.prelim}
                                                            </td>
                                                            <td className="p-3">
                                                                {g.midterm}
                                                            </td>
                                                            <td className="p-3">
                                                                {g.finals}
                                                            </td>
                                                            <td className="p-3">
                                                                {g.raw_average}%
                                                            </td>
                                                            <td className="p-3 font-bold text-white">
                                                                {Number(
                                                                    g.grade_point,
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="p-3">
                                                                <span
                                                                    className={`px-2 py-0.5 text-xs rounded font-medium border ${
                                                                        g.remarks ===
                                                                        "Passed"
                                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                                    }`}
                                                                >
                                                                    {g.remarks}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                <button
                                                                    onClick={() =>
                                                                        openGradeModal(
                                                                            g.student_id,
                                                                            sub.id,
                                                                            g.prelim,
                                                                            g.midterm,
                                                                            g.finals,
                                                                        )
                                                                    }
                                                                    className="px-3 py-1 bg-teal-600 text-white text-xs rounded font-semibold hover:bg-teal-500 transition"
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
                                                            className="p-4 text-center text-neutral-500"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-2xl bg-neutral-950 p-6 shadow-2xl border border-neutral-800">
                            <h3 className="text-lg font-bold text-white mb-4">
                                Encode / Update Student Grade
                            </h3>
                            <form
                                onSubmit={handleGradeSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400">
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
                                        className="w-full mt-1 p-2.5 border border-neutral-800 rounded-lg bg-neutral-900 text-white text-sm focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400">
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
                                        className="w-full mt-1 p-2.5 border border-neutral-800 rounded-lg bg-neutral-900 text-white text-sm focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400">
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
                                        className="w-full mt-1 p-2.5 border border-neutral-800 rounded-lg bg-neutral-900 text-white text-sm focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGrade(null)}
                                        className="px-4 py-2 border border-neutral-800 rounded-lg text-sm text-neutral-300 hover:bg-neutral-900 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={gradeForm.processing}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-500 transition disabled:opacity-50"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-2xl bg-neutral-950 p-6 shadow-2xl border border-neutral-800">
                            <h3 className="text-lg font-bold text-white mb-4">
                                Create New Subject
                            </h3>
                            <form
                                onSubmit={handleSubjectSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400">
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
                                        className="w-full mt-1 p-2.5 border border-neutral-800 rounded-lg bg-neutral-900 text-white text-sm uppercase focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400">
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
                                        className="w-full mt-1 p-2.5 border border-neutral-800 rounded-lg bg-neutral-900 text-white text-sm focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400">
                                        Credit Units (Standard: 3)
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
                                        className="w-full mt-1 p-2.5 border border-neutral-800 rounded-lg bg-neutral-900 text-white text-sm focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsSubjectModalOpen(false)
                                        }
                                        className="px-4 py-2 border border-neutral-800 rounded-lg text-sm text-neutral-300 hover:bg-neutral-900 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={subjectForm.processing}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-500 transition disabled:opacity-50"
                                    >
                                        {subjectForm.processing
                                            ? "Creating..."
                                            : "Create"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 3: Mag-enroll ng Estudyante */}
                {isEnrollModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-2xl bg-neutral-950 p-6 shadow-2xl border border-neutral-800">
                            <h3 className="text-lg font-bold text-white mb-4">
                                Enroll Student to Subject
                            </h3>
                            <form
                                onSubmit={handleEnrollSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400">
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
                                        className="w-full mt-1 p-2.5 border border-neutral-800 rounded-lg bg-neutral-900 text-white text-sm focus:border-teal-500 focus:outline-none"
                                    >
                                        {subjects.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.subject_code} -{" "}
                                                {sub.subject_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400">
                                        Student Email
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
                                        placeholder="student@test.com"
                                        className="w-full mt-1 p-2.5 border border-neutral-800 rounded-lg bg-neutral-900 text-white text-sm focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                    {enrollForm.errors.student_email && (
                                        <p className="text-xs text-rose-400 mt-1">
                                            {enrollForm.errors.student_email}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEnrollModalOpen(false)
                                        }
                                        className="px-4 py-2 border border-neutral-800 rounded-lg text-sm text-neutral-300 hover:bg-neutral-900 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={enrollForm.processing}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-500 transition disabled:opacity-50"
                                    >
                                        {enrollForm.processing
                                            ? "Enrolling..."
                                            : "Enroll"}
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
