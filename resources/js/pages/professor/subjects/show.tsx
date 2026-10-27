import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import {
    ArrowLeft,
    Save,
    Download,
    Search,
    Sliders,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    GraduationCap,
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

interface AssessmentColumn {
    id: string;
    name: string;
    type: "pre_test" | "quiz" | "activity";
    maxScore: number;
}

interface ExamConfig {
    name: string;
    maxScore: number;
}

export default function SubjectShow({ auth, subject }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<
        "prelim" | "midterm" | "finals" | "summary"
    >("prelim");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Grading Weights (%)
    const [weights, setWeights] = useState({
        quizWeight: 30, // Pre-test & Quizzes %
        actWeight: 20, // Activities %
        examWeight: 50, // Major Periodical Exam %
    });

    const [baseFormula, setBaseFormula] = useState<"zero" | "base50">("zero");

    // Dynamic Columns para sa Pre-Test, Quizzes, at Activities
    const [columns, setColumns] = useState<
        Record<"prelim" | "midterm" | "finals", AssessmentColumn[]>
    >({
        prelim: [
            { id: "pt_1", name: "Pre-Test 1", type: "pre_test", maxScore: 20 },
            { id: "q_1", name: "Quiz 1", type: "quiz", maxScore: 20 },
            { id: "q_2", name: "Quiz 2", type: "quiz", maxScore: 20 },
            { id: "act_1", name: "Act 1", type: "activity", maxScore: 50 },
            { id: "act_2", name: "Act 2", type: "activity", maxScore: 50 },
        ],
        midterm: [
            { id: "pt_1", name: "Pre-Test 1", type: "pre_test", maxScore: 20 },
            { id: "q_1", name: "Quiz 1", type: "quiz", maxScore: 20 },
            { id: "act_1", name: "Act 1", type: "activity", maxScore: 50 },
        ],
        finals: [
            { id: "q_1", name: "Quiz 1", type: "quiz", maxScore: 20 },
            { id: "q_2", name: "Quiz 2", type: "quiz", maxScore: 20 },
            { id: "act_1", name: "Act 1", type: "activity", maxScore: 50 },
        ],
    });

    // 50 ITEMS LANG ANG LAHAT NG EXAM
    const [exams, setExams] = useState<
        Record<"prelim" | "midterm" | "finals", ExamConfig>
    >({
        prelim: { name: "Prelim Exam", maxScore: 50 },
        midterm: { name: "Midterm Exam", maxScore: 50 },
        finals: { name: "Finals Exam", maxScore: 50 },
    });

    const totalWeights =
        Number(weights.quizWeight || 0) +
        Number(weights.actWeight || 0) +
        Number(weights.examWeight || 0);
    const isWeightValid = totalWeights === 100;

    const gradesList = subject.grades || [];

    const getGradePoint = (raw: number) => {
        if (raw >= 97) return { point: 1.0, remarks: "Passed" };
        if (raw >= 94) return { point: 1.25, remarks: "Passed" };
        if (raw >= 91) return { point: 1.5, remarks: "Passed" };
        if (raw >= 88) return { point: 1.75, remarks: "Passed" };
        if (raw >= 85) return { point: 2.0, remarks: "Passed" };
        if (raw >= 82) return { point: 2.25, remarks: "Passed" };
        if (raw >= 79) return { point: 2.5, remarks: "Passed" };
        if (raw >= 76) return { point: 2.75, remarks: "Passed" };
        if (raw >= 75) return { point: 3.0, remarks: "Passed" };
        return { point: 5.0, remarks: "Failed" };
    };

    const calcCategoryPercentage = (earned: number, totalMax: number) => {
        if (totalMax <= 0) return 0;
        const ratio = Math.min(1, Math.max(0, earned / totalMax));
        if (baseFormula === "base50") {
            return ratio * 50 + 50;
        }
        return ratio * 100;
    };

    const computeDynamicTermScore = (
        scores: Record<string, number>,
        examScore: number,
        termCols: AssessmentColumn[],
        examMax: number,
        w: typeof weights,
    ) => {
        let quizEarned = 0,
            quizMax = 0;
        let actEarned = 0,
            actMax = 0;

        termCols.forEach((col) => {
            const sc = Number(scores[col.id] || 0);
            const mx = Number(col.maxScore || 1);

            if (col.type === "pre_test" || col.type === "quiz") {
                quizEarned += sc;
                quizMax += mx;
            } else if (col.type === "activity") {
                actEarned += sc;
                actMax += mx;
            }
        });

        const quizPct = calcCategoryPercentage(quizEarned, quizMax);
        const actPct = calcCategoryPercentage(actEarned, actMax);
        const examPct = calcCategoryPercentage(
            Number(examScore || 0),
            Number(examMax || 1),
        );

        const qRatio = (Number(w.quizWeight) || 0) / 100;
        const actRatio = (Number(w.actWeight) || 0) / 100;
        const examRatio = (Number(w.examWeight) || 0) / 100;

        const total =
            quizPct * qRatio + actPct * actRatio + examPct * examRatio;
        return parseFloat(Math.min(100, Math.max(0, total)).toFixed(2));
    };

    const form = useForm({
        students: gradesList.map((g) => {
            const pTotal = Number(g.prelim) || 0;
            const mTotal = Number(g.midterm) || 0;
            const fTotal = Number(g.finals) || 0;
            const raw =
                Number(g.raw_average) ||
                parseFloat(
                    (pTotal * 0.3 + mTotal * 0.3 + fTotal * 0.4).toFixed(2),
                );
            const gp = getGradePoint(raw);

            return {
                student_id: g.student_id,
                student_name: g.student?.name || "Student",
                student_email: g.student?.email || "",
                prelim: {
                    scores: {
                        pt_1: 16,
                        q_1: 18,
                        q_2: 17,
                        act_1: 45,
                        act_2: 46,
                    } as Record<string, number>,
                    examScore: 42,
                    total: pTotal || 82,
                },
                midterm: {
                    scores: { pt_1: 16, q_1: 18, act_1: 45 } as Record<
                        string,
                        number
                    >,
                    examScore: 42,
                    total: mTotal || 80,
                },
                finals: {
                    scores: { q_1: 18, q_2: 17, act_1: 45 } as Record<
                        string,
                        number
                    >,
                    examScore: 44,
                    total: fTotal || 85,
                },
                raw_average: raw,
                grade_point: gp.point,
                remarks: gp.remarks,
            };
        }),
    });

    const recalculateEntireSheet = (
        updatedCols = columns,
        updatedExams = exams,
        newWeights = weights,
        formula = baseFormula,
    ) => {
        const updated = form.data.students.map((student) => {
            const pTotal = computeDynamicTermScore(
                student.prelim.scores,
                student.prelim.examScore,
                updatedCols.prelim,
                updatedExams.prelim.maxScore,
                newWeights,
            );
            const mTotal = computeDynamicTermScore(
                student.midterm.scores,
                student.midterm.examScore,
                updatedCols.midterm,
                updatedExams.midterm.maxScore,
                newWeights,
            );
            const fTotal = computeDynamicTermScore(
                student.finals.scores,
                student.finals.examScore,
                updatedCols.finals,
                updatedExams.finals.maxScore,
                newWeights,
            );

            const raw = parseFloat(
                (pTotal * 0.3 + mTotal * 0.3 + fTotal * 0.4).toFixed(2),
            );
            const gp = getGradePoint(raw);

            return {
                ...student,
                prelim: { ...student.prelim, total: pTotal },
                midterm: { ...student.midterm, total: mTotal },
                finals: { ...student.finals, total: fTotal },
                raw_average: raw,
                grade_point: gp.point,
                remarks: gp.remarks,
            };
        });

        form.setData("students", updated);
    };

    // Add Column
    const handleAddColumn = (type: "pre_test" | "quiz" | "activity") => {
        if (activeTab === "summary") return;

        const currentCols = columns[activeTab];
        const count = currentCols.filter((c) => c.type === type).length + 1;
        const typeLabel =
            type === "pre_test"
                ? `Pre-Test ${count}`
                : type === "quiz"
                  ? `Quiz ${count}`
                  : `Act ${count}`;

        const defaultMax = type === "pre_test" || type === "quiz" ? 20 : 50;
        const newCol: AssessmentColumn = {
            id: `${type}_${Date.now()}`,
            name: typeLabel,
            type,
            maxScore: defaultMax,
        };

        const updatedCols = {
            ...columns,
            [activeTab]: [...currentCols, newCol],
        };

        setColumns(updatedCols);
        recalculateEntireSheet(updatedCols, exams, weights, baseFormula);
    };

    // Delete Column
    const handleDeleteColumn = (colId: string) => {
        if (activeTab === "summary") return;

        const updatedCols = {
            ...columns,
            [activeTab]: columns[activeTab].filter((c) => c.id !== colId),
        };

        setColumns(updatedCols);
        recalculateEntireSheet(updatedCols, exams, weights, baseFormula);
    };

    // Edit Column Max Score
    const handleMaxScoreChange = (colId: string, val: number) => {
        if (activeTab === "summary") return;

        const cleanVal = Math.max(1, val || 1);
        const updatedCols = {
            ...columns,
            [activeTab]: columns[activeTab].map((c) =>
                c.id === colId ? { ...c, maxScore: cleanVal } : c,
            ),
        };

        setColumns(updatedCols);
        recalculateEntireSheet(updatedCols, exams, weights, baseFormula);
    };

    // Edit Exam Max Score
    const handleExamMaxScoreChange = (val: number) => {
        if (activeTab === "summary") return;

        const cleanVal = Math.max(1, val || 1);
        const updatedExams = {
            ...exams,
            [activeTab]: { ...exams[activeTab], maxScore: cleanVal },
        };

        setExams(updatedExams);
        recalculateEntireSheet(columns, updatedExams, weights, baseFormula);
    };

    // Student Assessment Input Change
    const handleScoreInputChange = (
        studentIdx: number,
        colId: string,
        val: number,
    ) => {
        if (activeTab === "summary") return;

        const updated = [...form.data.students];
        const student = updated[studentIdx];
        const termData = student[activeTab];

        const targetCol = columns[activeTab].find((c) => c.id === colId);
        const maxVal = targetCol ? targetCol.maxScore : 100;
        const cleanVal = Math.min(maxVal, Math.max(0, val || 0));

        termData.scores[colId] = cleanVal;

        const newTermTotal = computeDynamicTermScore(
            termData.scores,
            termData.examScore,
            columns[activeTab],
            exams[activeTab].maxScore,
            weights,
        );
        termData.total = newTermTotal;

        const p = student.prelim.total;
        const m = student.midterm.total;
        const f = student.finals.total;

        const raw = parseFloat((p * 0.3 + m * 0.3 + f * 0.4).toFixed(2));
        const gp = getGradePoint(raw);

        student.raw_average = raw;
        student.grade_point = gp.point;
        student.remarks = gp.remarks;

        form.setData("students", updated);
    };

    // Student Exam Score Input Change
    const handleExamScoreChange = (studentIdx: number, val: number) => {
        if (activeTab === "summary") return;

        const updated = [...form.data.students];
        const student = updated[studentIdx];
        const termData = student[activeTab];
        const maxVal = exams[activeTab].maxScore;
        const cleanVal = Math.min(maxVal, Math.max(0, val || 0));

        termData.examScore = cleanVal;

        const newTermTotal = computeDynamicTermScore(
            termData.scores,
            cleanVal,
            columns[activeTab],
            maxVal,
            weights,
        );
        termData.total = newTermTotal;

        const p = student.prelim.total;
        const m = student.midterm.total;
        const f = student.finals.total;

        const raw = parseFloat((p * 0.3 + m * 0.3 + f * 0.4).toFixed(2));
        const gp = getGradePoint(raw);

        student.raw_average = raw;
        student.grade_point = gp.point;
        student.remarks = gp.remarks;

        form.setData("students", updated);
    };

    // Save to Database
    const handleSaveRecords = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = form.data.students.map((s) => ({
            student_id: s.student_id,
            subject_id: subject.id,
            prelim: s.prelim.total,
            midterm: s.midterm.total,
            finals: s.finals.total,
            raw_average: s.raw_average,
            grade_point: s.grade_point,
            remarks: s.remarks,
        }));

        form.post(`/professor/subjects/${subject.id}/grades/batch`, {
            preserveScroll: true,
        });
    };

    // Export CSV
    const exportCSV = () => {
        if (form.data.students.length === 0) return;

        const headers = [
            "Student Name",
            "Student Email",
            "Prelim Grade",
            "Midterm Grade",
            "Finals Grade",
            "Raw Weighted Average",
            "Grade Point",
            "Remarks",
        ];

        const rows = form.data.students.map((s) => [
            `"${s.student_name}"`,
            `"${s.student_email}"`,
            s.prelim.total,
            s.midterm.total,
            s.finals.total,
            s.raw_average,
            Number(s.grade_point).toFixed(2),
            s.remarks,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute(
            "download",
            `${subject.subject_code}_Electronic_Class_Record_${new Date().toISOString().split("T")[0]}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const displayedStudents = form.data.students
        .map((student, originalIndex) => ({
            ...student,
            originalIndex,
        }))
        .filter(
            (s) =>
                s.student_name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                s.student_email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
        );

    return (
        <>
            <Head title={`${subject.subject_code} Electronic Class Record`} />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 sm:p-6 bg-zinc-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-full transition-colors duration-200">
                {/* 1. TOP HEADER & CONTROLS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/professor/subjects"
                            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                    {subject.subject_code}
                                </span>
                                <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white truncate max-w-md">
                                    {subject.subject_name}
                                </h2>
                            </div>
                            <span className="text-[11px] text-neutral-400 mt-0.5 block font-mono">
                                Standard 50-Item Major Exam • Teal Shaded Column
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                isSettingsOpen
                                    ? "bg-teal-600 text-white border-teal-600 shadow-xs shadow-teal-900/20"
                                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                        >
                            <Sliders size={13} />
                            <span>Grading Criteria</span>
                        </button>

                        <button
                            type="button"
                            onClick={exportCSV}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                        >
                            <Download size={13} />
                            <span>Export CSV</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveRecords}
                            disabled={form.processing || !isWeightValid}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs shadow-teal-900/20 disabled:opacity-50 cursor-pointer active:scale-95"
                        >
                            <Save size={13} />
                            <span>
                                {form.processing
                                    ? "Saving..."
                                    : "Save All Records"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* 2. DYNAMIC CRITERIA CONFIGURATION PANEL */}
                {isSettingsOpen && (
                    <div className="p-4 rounded-2xl border border-teal-500/30 bg-teal-500/5 dark:bg-neutral-900/90 shadow-xs animate-in fade-in duration-200 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                                    <Sliders size={14} />
                                    <span>
                                        Faculty Percentage Configuration
                                    </span>
                                </h4>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                    I-set ang percentage weights ng kategorya.
                                    Awtomatikong magko-compute muli ang lahat ng
                                    talaan.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-800/80 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-2xs">
                                    <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                                        Pre-Test & Quizzes:
                                    </span>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={weights.quizWeight}
                                        onChange={(e) => {
                                            const w = {
                                                ...weights,
                                                quizWeight:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            };
                                            setWeights(w);
                                            recalculateEntireSheet(
                                                columns,
                                                exams,
                                                w,
                                                baseFormula,
                                            );
                                        }}
                                        className="w-12 h-7 text-center rounded-lg border border-neutral-300 dark:border-neutral-600 font-mono font-bold text-xs bg-transparent focus:border-teal-500 focus:outline-none"
                                    />
                                    <span className="text-xs text-neutral-400 font-bold">
                                        %
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-800/80 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-2xs">
                                    <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                                        Activities:
                                    </span>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={weights.actWeight}
                                        onChange={(e) => {
                                            const w = {
                                                ...weights,
                                                actWeight:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            };
                                            setWeights(w);
                                            recalculateEntireSheet(
                                                columns,
                                                exams,
                                                w,
                                                baseFormula,
                                            );
                                        }}
                                        className="w-12 h-7 text-center rounded-lg border border-neutral-300 dark:border-neutral-600 font-mono font-bold text-xs bg-transparent focus:border-teal-500 focus:outline-none"
                                    />
                                    <span className="text-xs text-neutral-400 font-bold">
                                        %
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 bg-teal-500/15 dark:bg-teal-950/50 px-2.5 py-1.5 rounded-xl border border-teal-500/30 shadow-2xs">
                                    <span className="text-[11px] font-black text-neutral-900 dark:text-white">
                                        Major Exam (50 Pts):
                                    </span>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={weights.examWeight}
                                        onChange={(e) => {
                                            const w = {
                                                ...weights,
                                                examWeight:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            };
                                            setWeights(w);
                                            recalculateEntireSheet(
                                                columns,
                                                exams,
                                                w,
                                                baseFormula,
                                            );
                                        }}
                                        className="w-12 h-7 text-center rounded-lg border border-teal-400 dark:border-teal-600 font-mono font-bold text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-teal-500 focus:outline-none"
                                    />
                                    <span className="text-xs text-teal-600 dark:text-teal-400 font-bold">
                                        %
                                    </span>
                                </div>

                                <div
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                                        isWeightValid
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                    }`}
                                >
                                    {isWeightValid ? (
                                        <>
                                            <CheckCircle2 size={13} />
                                            <span>Total: {totalWeights}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={13} />
                                            <span>
                                                Total: {totalWeights}% (Dapat
                                                100%)
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Formula Selection */}
                        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center gap-3">
                            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                                Transmutation Formula:
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBaseFormula("zero");
                                        recalculateEntireSheet(
                                            columns,
                                            exams,
                                            weights,
                                            "zero",
                                        );
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                        baseFormula === "zero"
                                            ? "bg-teal-600 text-white border-teal-600"
                                            : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                                    }`}
                                >
                                    Zero-Based (Raw / Items × 100)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBaseFormula("base50");
                                        recalculateEntireSheet(
                                            columns,
                                            exams,
                                            weights,
                                            "base50",
                                        );
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                        baseFormula === "base50"
                                            ? "bg-teal-600 text-white border-teal-600"
                                            : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                                    }`}
                                >
                                    Base-50 College Standard (Raw / Items × 50 +
                                    50)
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. TERM TABS & ADD COLUMN CONTROLS */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Period Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab("prelim")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                                activeTab === "prelim"
                                    ? "bg-teal-600 text-white shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            }`}
                        >
                            Prelim Sheet
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("midterm")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                                activeTab === "midterm"
                                    ? "bg-teal-600 text-white shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            }`}
                        >
                            Midterm Sheet
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("finals")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                                activeTab === "finals"
                                    ? "bg-teal-600 text-white shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            }`}
                        >
                            Finals Sheet
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("summary")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                                activeTab === "summary"
                                    ? "bg-teal-600 text-white shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            }`}
                        >
                            Semestral Master Summary
                        </button>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2">
                        {activeTab !== "summary" && (
                            <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => handleAddColumn("pre_test")}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold transition cursor-pointer"
                                >
                                    <Plus size={12} />
                                    <span>Pre-Test</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleAddColumn("quiz")}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold transition cursor-pointer"
                                >
                                    <Plus size={12} />
                                    <span>Quiz</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleAddColumn("activity")}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold transition cursor-pointer"
                                >
                                    <Plus size={12} />
                                    <span>Activity</span>
                                </button>
                            </div>
                        )}

                        <div className="relative w-44 sm:w-52">
                            <Search
                                size={13}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter student..."
                                className="w-full h-9 pl-8 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-teal-500 focus:outline-none transition"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. DYNAMIC ECR DATA TABLE (TEAL-SHADED EXAM COLUMN NA MAY ADAPTIVE TEXT COLOR) */}
                <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs bg-white dark:bg-neutral-900/60">
                    <div className="overflow-x-auto">
                        {/* ================= A. DYNAMIC TERM SHEET ================= */}
                        {activeTab !== "summary" && (
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-neutral-50 dark:bg-neutral-900/90 text-neutral-500 dark:text-neutral-400 text-[10px] uppercase font-bold tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                                    <tr>
                                        {/* Sticky Student Profile Header */}
                                        <th className="py-3 px-4 w-52 sticky left-0 z-20 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-xs">
                                            Student Profile
                                        </th>

                                        {/* Regular Dynamic Columns: Pre-test, Quizzes, Activities */}
                                        {columns[activeTab].map((col) => (
                                            <th
                                                key={col.id}
                                                className="py-3 px-3 text-center min-w-[136px] border-r border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/50"
                                            >
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                                        {col.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteColumn(
                                                                col.id,
                                                            )
                                                        }
                                                        className="text-neutral-400 hover:text-rose-500 transition cursor-pointer p-0.5 rounded"
                                                        title="Delete Column"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                </div>
                                                <div className="text-[9px] font-mono mt-0.5 lowercase text-neutral-400">
                                                    score / items
                                                </div>
                                            </th>
                                        ))}

                                        {/* TEAL-SHADED MAJOR EXAM HEADER (BLACK SA LIGHT MODE, WHITE SA DARK MODE) */}
                                        <th className="py-3 px-3 text-center min-w-[140px] border-r border-teal-500/40 bg-teal-500/20 dark:bg-teal-950/70 border-b-2 border-b-teal-500 text-neutral-900 dark:text-white">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <GraduationCap
                                                    size={13}
                                                    className="text-teal-700 dark:text-teal-300"
                                                />
                                                <span className="font-black">
                                                    {exams[activeTab].name}
                                                </span>
                                            </div>
                                            <div className="text-[9px] font-mono mt-0.5 lowercase text-neutral-800/80 dark:text-neutral-200/80 font-bold">
                                                score / items (50 pts •{" "}
                                                {weights.examWeight}%)
                                            </div>
                                        </th>

                                        {/* Term Total Column */}
                                        <th className="py-3 px-4 text-center w-28 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold border-l border-teal-500/20">
                                            {activeTab.toUpperCase()} TOTAL
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                                    {displayedStudents.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={
                                                    columns[activeTab].length +
                                                    3
                                                }
                                                className="py-12 text-center text-neutral-400 text-xs"
                                            >
                                                No students recorded in this
                                                section.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedStudents.map((item) => {
                                            const rec = item[activeTab];
                                            const oIdx = item.originalIndex;

                                            return (
                                                <tr
                                                    key={item.student_id}
                                                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition group"
                                                >
                                                    {/* Sticky Student Profile Cell */}
                                                    <td className="py-2.5 px-4 sticky left-0 z-10 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-xs group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800/80 transition">
                                                        <p className="font-bold text-neutral-900 dark:text-white truncate max-w-[170px]">
                                                            {item.student_name}
                                                        </p>
                                                        <span className="text-[10px] text-neutral-400 font-mono block truncate max-w-[170px]">
                                                            {item.student_email}
                                                        </span>
                                                    </td>

                                                    {/* Pre-Test, Quiz, Activity Inputs */}
                                                    {columns[activeTab].map(
                                                        (col) => {
                                                            const currentScore =
                                                                rec.scores[
                                                                    col.id
                                                                ] ?? 0;

                                                            return (
                                                                <td
                                                                    key={col.id}
                                                                    className="py-2.5 px-3 text-center border-r border-neutral-200/60 dark:border-neutral-800/60"
                                                                >
                                                                    <div className="inline-flex items-center justify-center gap-1.5 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-100/70 dark:bg-neutral-800/50 shadow-2xs">
                                                                        <input
                                                                            type="number"
                                                                            min={
                                                                                0
                                                                            }
                                                                            max={
                                                                                col.maxScore
                                                                            }
                                                                            value={
                                                                                currentScore
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleScoreInputChange(
                                                                                    oIdx,
                                                                                    col.id,
                                                                                    parseFloat(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    ) ||
                                                                                        0,
                                                                                )
                                                                            }
                                                                            className="w-12 h-7 text-center rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono font-bold text-xs focus:border-teal-500 focus:outline-none"
                                                                        />

                                                                        <span className="font-mono font-bold text-xs select-none text-neutral-400">
                                                                            /
                                                                        </span>

                                                                        <input
                                                                            type="number"
                                                                            min={
                                                                                1
                                                                            }
                                                                            value={
                                                                                col.maxScore
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleMaxScoreChange(
                                                                                    col.id,
                                                                                    parseFloat(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    ) ||
                                                                                        1,
                                                                                )
                                                                            }
                                                                            className="w-12 h-7 text-center rounded-lg border border-dashed border-teal-500/40 dark:border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-mono font-bold text-xs focus:border-teal-500 focus:outline-none"
                                                                            title="Change total items"
                                                                        />
                                                                    </div>
                                                                </td>
                                                            );
                                                        },
                                                    )}

                                                    {/* TEAL-SHADED MAJOR EXAM CELL (ADAPTIVE FONT: BLACK SA LIGHT, WHITE SA DARK) */}
                                                    <td className="py-2.5 px-3 text-center border-r border-teal-500/30 bg-teal-500/15 dark:bg-teal-950/50 text-neutral-900 dark:text-white">
                                                        <div className="inline-flex items-center justify-center gap-1.5 p-1 rounded-xl border border-teal-500/50 bg-teal-500/20 dark:bg-teal-900/50 shadow-2xs">
                                                            {/* Student Score over 50 */}
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={
                                                                    exams[
                                                                        activeTab
                                                                    ].maxScore
                                                                }
                                                                value={
                                                                    rec.examScore
                                                                }
                                                                onChange={(e) =>
                                                                    handleExamScoreChange(
                                                                        oIdx,
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                    )
                                                                }
                                                                className="w-12 h-7 text-center rounded-lg border border-teal-400/80 dark:border-teal-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono font-black text-xs focus:border-teal-500 focus:outline-none"
                                                            />

                                                            <span className="font-mono font-black text-xs select-none text-neutral-900 dark:text-white">
                                                                /
                                                            </span>

                                                            {/* Fixed 50 items default */}
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={
                                                                    exams[
                                                                        activeTab
                                                                    ].maxScore
                                                                }
                                                                onChange={(e) =>
                                                                    handleExamMaxScoreChange(
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 1,
                                                                    )
                                                                }
                                                                className="w-12 h-7 text-center rounded-lg border border-dashed border-teal-600/70 dark:border-teal-400/60 bg-teal-100/60 dark:bg-teal-900/60 text-neutral-900 dark:text-white font-mono font-black text-xs focus:border-teal-500 focus:outline-none"
                                                                title="Total items for Major Exam (Default: 50)"
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* Term Total Result */}
                                                    <td className="py-2.5 px-4 text-center bg-teal-500/10 border-l border-teal-500/20 font-mono font-black text-xs text-teal-600 dark:text-teal-400">
                                                        {rec.total}%
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* ================= B. MASTER SUMMARY VIEW ================= */}
                        {activeTab === "summary" && (
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-neutral-50 dark:bg-neutral-900/90 text-neutral-500 dark:text-neutral-400 text-[10px] uppercase font-bold tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                                    <tr>
                                        <th className="py-3 px-4 w-52 sticky left-0 z-20 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-xs">
                                            Student Profile
                                        </th>
                                        <th className="py-3 px-4 text-center">
                                            Prelim (30%)
                                        </th>
                                        <th className="py-3 px-4 text-center">
                                            Midterm (30%)
                                        </th>
                                        <th className="py-3 px-4 text-center">
                                            Finals (40%)
                                        </th>
                                        <th className="py-3 px-4 text-center">
                                            Raw Weighted Avg
                                        </th>
                                        <th className="py-3 px-4 text-center">
                                            Equivalent Point
                                        </th>
                                        <th className="py-3 px-4 text-center">
                                            Academic Standing
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                                    {displayedStudents.map((s) => (
                                        <tr
                                            key={s.student_id}
                                            className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition group"
                                        >
                                            <td className="py-3 px-4 sticky left-0 z-10 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-xs group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800/80 transition">
                                                <p className="font-bold text-neutral-900 dark:text-white truncate max-w-[170px]">
                                                    {s.student_name}
                                                </p>
                                                <span className="text-[10px] text-neutral-400 font-mono block truncate max-w-[170px]">
                                                    {s.student_email}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono font-bold">
                                                {s.prelim.total}%
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono font-bold">
                                                {s.midterm.total}%
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono font-bold">
                                                {s.finals.total}%
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono font-black text-neutral-900 dark:text-white">
                                                {s.raw_average}%
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span
                                                    className={`font-mono font-black text-xs ${
                                                        s.grade_point > 3.0
                                                            ? "text-rose-600 dark:text-rose-400"
                                                            : "text-teal-600 dark:text-teal-400"
                                                    }`}
                                                >
                                                    {Number(
                                                        s.grade_point,
                                                    ).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 text-[9px] rounded-full font-bold uppercase tracking-wider border ${
                                                        s.remarks === "Passed"
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                                    }`}
                                                >
                                                    {s.remarks}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

SubjectShow.layout = {
    breadcrumbs: [
        {
            title: "My Subjects",
            href: "/professor/subjects",
        },
        {
            title: "Electronic Class Record",
            href: "#",
        },
    ],
};
