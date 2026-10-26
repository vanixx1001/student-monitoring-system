import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import {
    PlusCircle,
    UserPlus,
    Users,
    ArrowUpRight,
    X,
    FolderKanban,
    Search,
} from "lucide-react";

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Grade {
    id: number;
    student_id: number;
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

export default function SubjectsIndex({ subjects = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

    const subjectForm = useForm({
        subject_code: "",
        subject_name: "",
        units: 3,
    });

    const enrollForm = useForm({
        subject_id: subjects[0]?.id || 0,
        student_email: "",
    });

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

    const filteredSubjects = subjects.filter(
        (sub) =>
            sub.subject_code
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            sub.subject_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <>
            <Head title="My Subjects - University of Vanixx Portal" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 sm:p-6 bg-zinc-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-full transition-colors duration-200">
                {/* Search Bar at Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:max-w-xs">
                        <Search
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search subjects..."
                            className="w-full h-9.5 pl-9.5 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-teal-500 focus:outline-none transition shadow-2xs"
                        />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setIsSubjectModalOpen(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition shadow-sm shadow-teal-900/20 active:scale-95 cursor-pointer"
                        >
                            <PlusCircle size={14} />
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
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-95 cursor-pointer shadow-2xs"
                        >
                            <UserPlus size={14} />
                            <span>Enroll Student</span>
                        </button>
                    </div>
                </div>

                {/* Subject Cards Grid */}
                {filteredSubjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center text-neutral-500 dark:text-neutral-400 bg-white/50 dark:bg-neutral-900/40">
                        <FolderKanban
                            size={32}
                            className="mb-2 text-neutral-400"
                        />
                        <p className="font-semibold text-sm">
                            Walang nakitang subject.
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            Pindutin ang "+ Create Subject" para magsimula.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredSubjects.map((sub) => {
                            const enrolleesCount = sub.grades
                                ? sub.grades.length
                                : 0;
                            return (
                                <div
                                    key={sub.id}
                                    className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-5 shadow-xs hover:border-teal-500/50 transition group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                                {sub.subject_code}
                                            </span>
                                            <span className="text-[11px] font-medium text-neutral-400">
                                                {sub.units} Units
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition leading-snug">
                                            {sub.subject_name}
                                        </h3>

                                        <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                            <Users
                                                size={13}
                                                className="text-teal-600 dark:text-teal-400"
                                            />
                                            <span>
                                                <strong className="text-neutral-800 dark:text-neutral-200">
                                                    {enrolleesCount}
                                                </strong>{" "}
                                                Enrolled
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-end">
                                        <Link
                                            href={`/professor/subjects/${sub.id}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/90 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition active:scale-95 cursor-pointer"
                                        >
                                            <span>View Sheet</span>
                                            <ArrowUpRight size={13} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* MODAL: Create Subject */}
                {isSubjectModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                    Create New Subject
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsSubjectModalOpen(false)}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <form
                                onSubmit={handleSubjectSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Subject Code
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
                                        className="w-full mt-1.5 h-10 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-mono uppercase focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                                        className="w-full mt-1.5 h-10 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                                        className="w-full mt-1.5 h-10 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-mono focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsSubjectModalOpen(false)
                                        }
                                        className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={subjectForm.processing}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-teal-900/20"
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

                {/* MODAL: Enroll Student */}
                {isEnrollModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                    Enroll Student to Subject
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsEnrollModalOpen(false)}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <form
                                onSubmit={handleEnrollSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                                        className="w-full mt-1.5 h-10 px-3 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs focus:border-teal-500 focus:outline-none"
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
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                                        className="w-full mt-1.5 h-10 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                    {enrollForm.errors.student_email && (
                                        <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">
                                            {enrollForm.errors.student_email}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEnrollModalOpen(false)
                                        }
                                        className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={enrollForm.processing}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-teal-900/20"
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

SubjectsIndex.layout = {
    breadcrumbs: [
        {
            title: "My Subjects",
            href: "/professor/subjects",
        },
    ],
};
