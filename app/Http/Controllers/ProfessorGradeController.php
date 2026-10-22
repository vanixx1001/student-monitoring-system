<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Subject;
use Illuminate\Http\Request;

class ProfessorGradeController extends Controller
{
    /**
     * Kunin ang listahan ng subjects na hawak ng professor.
     */
    public function getSubjects(Request $request)
    {
        $professorId = $request->query('professor_id');
        $subjects = Subject::where('professor_id', $professorId)->get();

        return response()->json([
            'status' => 'success',
            'subjects' => $subjects,
        ]);
    }

    /**
     * Gumawa ng bagong subject ang professor.
     */
    public function storeSubject(Request $request)
    {
        $validated = $request->validate([
            'professor_id' => 'required|exists:users,id',
            'subject_code' => 'required|string|max:20',
            'subject_name' => 'required|string|max:255',
            'units' => 'required|integer|min:1|max:6',
        ]);

        $subject = Subject::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Subject created successfully!',
            'subject' => $subject,
        ]);
    }

    /**
     * Kunin ang mga estudyante at grades sa isang partikular na subject.
     */
    public function getSubjectGrades($subjectId)
    {
        $subject = Subject::with(['grades.student'])->findOrFail($subjectId);

        return response()->json([
            'status' => 'success',
            'subject' => $subject,
        ]);
    }

    /**
     * Encode o update ng Prelim, Midterm, Finals grade.
     */
    public function updateGrade(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'prelim' => 'required|numeric|min:0|max:100',
            'midterm' => 'required|numeric|min:0|max:100',
            'finals' => 'required|numeric|min:0|max:100',
        ]);

        // Compute Raw Average
        $rawAvg = round(($validated['prelim'] + $validated['midterm'] + $validated['finals']) / 3, 2);

        // Compute Grade Point at Remarks (ICCT Scale)
        $point = $this->calculateGradePoint($rawAvg);
        $remarks = $point <= 3.00 ? 'Passed' : 'Failed';

        $grade = Grade::updateOrCreate(
            [
                'student_id' => $validated['student_id'],
                'subject_id' => $validated['subject_id'],
            ],
            [
                'prelim' => $validated['prelim'],
                'midterm' => $validated['midterm'],
                'finals' => $validated['finals'],
                'raw_average' => $rawAvg,
                'grade_point' => $point,
                'remarks' => $remarks,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Grade computed and saved successfully!',
            'data' => $grade,
        ]);
    }

    /**
     * Helper calculation para sa ICCT 1.00 - 5.00 Grade Scale.
     */
    private function calculateGradePoint(float $rawAvg): float
    {
        if ($rawAvg >= 97.00)
            return 1.00;
        if ($rawAvg >= 94.00)
            return 1.25;
        if ($rawAvg >= 91.00)
            return 1.50;
        if ($rawAvg >= 88.00)
            return 1.75;
        if ($rawAvg >= 85.00)
            return 2.00;
        if ($rawAvg >= 82.00)
            return 2.25;
        if ($rawAvg >= 79.00)
            return 2.50;
        if ($rawAvg >= 76.00)
            return 2.75;
        if ($rawAvg >= 75.00)
            return 3.00;
        return 5.00;
    }
}