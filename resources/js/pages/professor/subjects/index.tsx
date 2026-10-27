import { Head, Link, useForm } from "@inertiajs/react";
import { useState, useMemo, useRef, useEffect } from "react";
import {
    BookMarked,
    Plus,
    Search,
    ArrowUpRight,
    AlertTriangle,
    X,
    CheckCircle2,
    BookOpen,
    Clock,
    UserPlus,
    UserCheck,
    ChevronDown,
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

interface StudentOption {
    id: number;
    name: string;
    email: string;
}

interface Props {
    auth: { user: { id: number; name: string; email: string; role: string } };
    subjects?: Subject[];
    allStudents?: StudentOption[];
}

export default function SubjectsIndex({
    auth,
    subjects = [],
    allStudents = [],
}: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [unitFilter, setUnitFilter] = useState<number | "all">("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Modal para sa pag-enroll ng estudyante
    const [enrollingSubject, setEnrollingSubject] = useState<Subject | null>(
        null,
    );
    const [studentSearchInput, setStudentSearchInput] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Form: Create Course
    const createForm = useForm({
        subject_code: "",
        subject_name: "",
        units: 3,
    });

    // Form: Enroll Student
    const enrollForm = useForm({
        subject_id: 0,
        email: "",
    });

    // Isara ang dropdown kapag nag-click sa labas
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreateSubject = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post("/professor/subjects/create", {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEnrollStudent = (e: React.FormEvent) => {
        e.preventDefault();
        enrollForm.post("/professor/subjects/enroll", {
            onSuccess: () => {
                setEnrollingSubject(null);
                setStudentSearchInput("");
                enrollForm.reset();
            },
        });
    };

    // Filtered Students list para sa Dropdown
    const availableStudentsForClass = useMemo(() => {
        if (!allStudents || allStudents.length === 0) return [];

        const query = (studentSearchInput || "").toLowerCase().trim();

        // Kunin ang mga naka-enroll na sa kasalukuyang binuksang subject
        const enrolledIds = new Set(
            (enrollingSubject?.grades || []).map((g) => g.student_id),
        );

        return allStudents.filter((st) => {
            // Huwag ipakita kung naka-enroll na sa klaseng ito
            if (enrolledIds.has(st.id)) return false;

            // Kung walang tinatype si prof sa search box, ilabas agad lahat
            if (!query) return true;

            // Kung may tinatype, i-match sa name o email
            return (
                (st.name && st.name.toLowerCase().includes(query)) ||
                (st.email && st.email.toLowerCase().includes(query))
            );
        });
    }, [allStudents, studentSearchInput, enrollingSubject]);

    const handleSelectStudent = (student: StudentOption) => {
        enrollForm.setData("email", student.email);
        setStudentSearchInput(`${student.name} (${student.email})`);
        setIsDropdownOpen(false);
    };

    // Subject Metrics
    const metrics = useMemo(() => {
        let totalUnits = 0;
        let pendingEncodingClasses = 0;
        let fullyCompletedClasses = 0;

        subjects.forEach((sub) => {
            totalUnits += Number(sub.units || 0);
            const grades = sub.grades || [];
            if (grades.length === 0) {
                pendingEncodingClasses++;
            } else {
                const completedGrades = grades.filter(
                    (g) => g.prelim > 0 && g.midterm > 0 && g.finals > 0,
                ).length;
                if (completedGrades === grades.length) {
                    fullyCompletedClasses++;
                } else {
                    pendingEncodingClasses++;
                }
            }
        });

        return {
            totalSubjects: subjects.length,
            totalUnits,
            pendingEncodingClasses,
            fullyCompletedClasses,
        };
    }, [subjects]);

    // Filtered Subjects base sa Search Bar
    const filteredSubjects = useMemo(() => {
        return subjects.filter((sub) => {
            const matchesSearch =
                sub.subject_code
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                sub.subject_name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            const matchesUnit =
                unitFilter === "all" || Number(sub.units) === unitFilter;

            return matchesSearch && matchesUnit;
        });
    }, [subjects, searchQuery, unitFilter]);

    return (
        <>
            <Head title="Course Management - University Portal" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 bg-zinc-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-full transition-colors duration-200">
                {/* 1. TEACHING LOAD TILES */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                Assigned Curriculum Load
                            </span>
                            <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mt-1">
                                {metrics.totalSubjects}{" "}
                                <span className="text-xs font-semibold text-neutral-400 font-sans">
                                    Assigned Classes
                                </span>
                            </div>
                            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5 block">
                                {metrics.totalUnits} Credit Units Required
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                            <BookMarked size={22} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                Evaluation Backlogs
                            </span>
                            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                                {metrics.pendingEncodingClasses}{" "}
                                <span className="text-xs font-semibold text-neutral-400 font-sans">
                                    Section(s)
                                </span>
                            </div>
                            <span className="text-[11px] text-neutral-400 mt-0.5 block">
                                Incomplete Prelim/Midterm/Finals records
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Clock size={22} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                Curriculum Management
                            </span>
                            <div className="text-xs font-bold text-neutral-900 dark:text-white mt-1">
                                Academic Year 2026–2027
                            </div>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block flex items-center gap-1">
                                <CheckCircle2 size={12} />{" "}
                                {metrics.fullyCompletedClasses} Completed Grade
                                Sheets
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs shadow-teal-900/20 active:scale-95 cursor-pointer shrink-0"
                        >
                            <Plus size={14} />
                            <span>Create Course</span>
                        </button>
                    </div>
                </div>

                {/* 2. TOOLBAR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => setUnitFilter("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                                unitFilter === "all"
                                    ? "bg-teal-600 text-white border-teal-600 shadow-xs shadow-teal-900/20"
                                    : "bg-white dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-teal-500/40"
                            }`}
                        >
                            All Units
                        </button>
                        {[3, 2, 1, 4].map((u) => (
                            <button
                                key={u}
                                type="button"
                                onClick={() => setUnitFilter(u)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                                    unitFilter === u
                                        ? "bg-teal-600 text-white border-teal-600 shadow-xs shadow-teal-900/20"
                                        : "bg-white dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-teal-500/40"
                                }`}
                            >
                                {u} Unit{u > 1 ? "s" : ""}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search
                            size={14}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by code or course title..."
                            className="w-full h-9 pl-9.5 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 cursor-text focus:border-teal-500 focus:outline-none transition shadow-2xs"
                        />
                    </div>
                </div>

                {/* 3. COURSE CARDS */}
                {filteredSubjects.length === 0 ? (
                    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center bg-white dark:bg-neutral-900/40">
                        <BookOpen
                            size={36}
                            className="mx-auto text-neutral-400 mb-3"
                        />
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                            No Courses Found
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                            Walang tugmang asignatura base sa iyong filter.
                            Subukang maghanap ng ibang code o mag-create ng
                            bagong kurso.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredSubjects.map((sub) => {
                            const grades = sub.grades || [];
                            const enrolleesCount = grades.length;
                            const activeGrades = grades.filter(
                                (g) =>
                                    g.prelim > 0 ||
                                    g.midterm > 0 ||
                                    g.finals > 0,
                            );
                            const passedCount = activeGrades.filter(
                                (g) => g.remarks === "Passed",
                            ).length;
                            const passingRate =
                                activeGrades.length > 0
                                    ? Math.round(
                                          (passedCount / activeGrades.length) *
                                              100,
                                      )
                                    : 0;

                            const atRiskCount = activeGrades.filter(
                                (g) =>
                                    g.grade_point > 3.0 ||
                                    g.remarks === "Failed",
                            ).length;

                            const completionPercentage =
                                enrolleesCount > 0
                                    ? Math.round(
                                          (activeGrades.length /
                                              enrolleesCount) *
                                              100,
                                      )
                                    : 0;

                            return (
                                <div
                                    key={sub.id}
                                    className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-teal-500/50 transition group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                                    {sub.subject_code}
                                                </span>
                                                <span className="text-[11px] font-semibold text-neutral-400 font-mono">
                                                    {sub.units} Units
                                                </span>
                                            </div>

                                            {/* ENROLL BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    enrollForm.setData(
                                                        "subject_id",
                                                        sub.id,
                                                    );
                                                    enrollForm.setData(
                                                        "email",
                                                        "",
                                                    );
                                                    setStudentSearchInput("");
                                                    setEnrollingSubject(sub);
                                                }}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-teal-500/10 text-neutral-600 dark:text-neutral-300 hover:text-teal-600 dark:hover:text-teal-400 text-[11px] font-bold transition cursor-pointer"
                                                title="Enroll new student"
                                            >
                                                <UserPlus size={12} />
                                                <span>Enroll</span>
                                            </button>
                                        </div>

                                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug line-clamp-2">
                                            {sub.subject_name}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                                                    Section Roster
                                                </span>
                                                <span className="font-bold text-neutral-900 dark:text-white font-mono">
                                                    {enrolleesCount} Students
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                                                    Section Pass Rate
                                                </span>
                                                <span
                                                    className={`font-bold font-mono ${
                                                        passingRate >= 75
                                                            ? "text-emerald-600 dark:text-emerald-400"
                                                            : "text-amber-600 dark:text-amber-400"
                                                    }`}
                                                >
                                                    {passingRate}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex justify-between text-[10px] font-semibold text-neutral-400 mb-1">
                                                <span>Term Grade Coverage</span>
                                                <span className="font-mono">
                                                    {completionPercentage}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-500 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${completionPercentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {atRiskCount > 0 && (
                                            <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
                                                <AlertTriangle
                                                    size={13}
                                                    className="shrink-0"
                                                />
                                                <span>
                                                    {atRiskCount} Student(s)
                                                    Flagged At-Risk
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <Link
                                            href={`/professor/subjects/${sub.id}`}
                                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition active:scale-98 cursor-pointer"
                                        >
                                            <span>
                                                Open Grade Sheet Masterlist
                                            </span>
                                            <ArrowUpRight size={13} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* MODAL 1: CREATE COURSE */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                        Create New Course Section
                                    </h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                        Add a subject to your faculty curriculum
                                        schedule.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleCreateSubject}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Subject Code
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.subject_code}
                                        onChange={(e) =>
                                            createForm.setData(
                                                "subject_code",
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="e.g. IT102, CC104, SA01"
                                        className="w-full mt-1.5 h-10 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-mono cursor-text focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Course Title / Description
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.subject_name}
                                        onChange={(e) =>
                                            createForm.setData(
                                                "subject_name",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. System Administration and Maintenance"
                                        className="w-full mt-1.5 h-10 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs cursor-text focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Credit Units
                                    </label>
                                    <select
                                        value={createForm.data.units}
                                        onChange={(e) =>
                                            createForm.setData(
                                                "units",
                                                parseInt(e.target.value) || 3,
                                            )
                                        }
                                        className="w-full mt-1.5 h-10 px-3.5 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs cursor-pointer focus:border-teal-500 focus:outline-none"
                                    >
                                        <option value={1}>
                                            1 Unit (Lab / Workshop)
                                        </option>
                                        <option value={2}>2 Units</option>
                                        <option value={3}>
                                            3 Units (Standard Lecture)
                                        </option>
                                        <option value={4}>
                                            4 Units (Lecture with Integrated
                                            Lab)
                                        </option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsCreateModalOpen(false)
                                        }
                                        className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition disabled:opacity-50 cursor-pointer shadow-xs shadow-teal-900/20"
                                    >
                                        {createForm.processing
                                            ? "Creating..."
                                            : "Save Course"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: ENROLL STUDENT VIA AUTOCOMPLETE SEARCHABLE DROPDOWN */}
                {enrollingSubject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                        Enroll Student to Class
                                    </h3>
                                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                                        {enrollingSubject.subject_code} •{" "}
                                        {enrollingSubject.subject_name}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEnrollingSubject(null);
                                        setStudentSearchInput("");
                                    }}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleEnrollStudent}
                                className="space-y-4"
                            >
                                {/* SEARCHABLE INPUT CONTAINER */}
                                <div className="relative" ref={dropdownRef}>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                        Select or Search Registered Student
                                    </label>

                                    <div className="relative mt-1.5">
                                        {/* FIELD: Type cursor para sa text typing */}
                                        <input
                                            type="text"
                                            value={studentSearchInput}
                                            onChange={(e) => {
                                                setStudentSearchInput(
                                                    e.target.value,
                                                );
                                                enrollForm.setData(
                                                    "email",
                                                    e.target.value,
                                                );
                                                setIsDropdownOpen(true);
                                            }}
                                            onFocus={() =>
                                                setIsDropdownOpen(true)
                                            }
                                            onClick={() =>
                                                setIsDropdownOpen(true)
                                            }
                                            placeholder="Type student name or email..."
                                            className="w-full h-10 pl-3.5 pr-10 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs cursor-text focus:border-teal-500 focus:outline-none transition shadow-2xs"
                                            required
                                        />

                                        {/* CHEVRON BUTTON: Clickable button na may CURSOR-POINTER */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDropdownOpen(
                                                    (prev) => !prev,
                                                );
                                            }}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 cursor-pointer transition"
                                            title="Toggle dropdown list"
                                        >
                                            <ChevronDown
                                                size={15}
                                                className={`cursor-pointer transition-transform duration-200 ${
                                                    isDropdownOpen
                                                        ? "rotate-180 text-teal-400"
                                                        : ""
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Dropdown Options Popup */}
                                    {isDropdownOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl z-50 divide-y divide-neutral-100 dark:divide-neutral-800/80 cursor-pointer select-none">
                                            {availableStudentsForClass.length ===
                                            0 ? (
                                                <div className="p-4 text-xs text-neutral-400 text-center cursor-default select-none">
                                                    Walang nahanap na student.
                                                </div>
                                            ) : (
                                                availableStudentsForClass.map(
                                                    (st) => (
                                                        <button
                                                            key={st.id}
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectStudent(
                                                                    st,
                                                                )
                                                            }
                                                            className="w-full text-left px-3.5 py-2.5 hover:bg-teal-500/10 transition cursor-pointer flex items-center justify-between group select-none"
                                                        >
                                                            <div className="cursor-pointer select-none">
                                                                <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 cursor-pointer select-none">
                                                                    {st.name}
                                                                </div>
                                                                <div className="text-[11px] text-neutral-400 font-mono cursor-pointer select-none">
                                                                    {st.email}
                                                                </div>
                                                            </div>
                                                            <UserCheck
                                                                size={14}
                                                                className="text-neutral-400 group-hover:text-teal-500 shrink-0 cursor-pointer"
                                                            />
                                                        </button>
                                                    ),
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEnrollingSubject(null);
                                            setStudentSearchInput("");
                                        }}
                                        className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            enrollForm.processing ||
                                            !enrollForm.data.email
                                        }
                                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition disabled:opacity-50 cursor-pointer shadow-xs shadow-teal-900/20"
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
