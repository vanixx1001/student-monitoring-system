<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentGradeController extends Controller
{
    /**
     * Kunin ang grades at GWA ng student batay sa subject units.
     */
    public function myGrades(Request $request)
    {
        $studentId = Auth::id() ?? $request->query('student_id');

        $grades = Grade::with('subject')
            ->where('student_id', $studentId)
            ->get();

        $totalUnits = 0;
        $totalWeightedPoints = 0;

        foreach ($grades as $grade) {
            $units = $grade->subject->units ?? 3;
            $totalUnits += $units;
            $totalWeightedPoints += ($grade->grade_point * $units);
        }

        // GWA formula: Sum(Grade Point * Units) / Total Units
        $gwa = $totalUnits > 0 ? round($totalWeightedPoints / $totalUnits, 2) : 0.00;

        // Academic Standing batay sa standard college threshold
        $standing = 'Good Standing';
        if ($gwa > 3.00 || $grades->contains('remarks', 'Failed')) {
            $standing = 'At-Risk (May Bagsak o Mababang GWA)';
        } elseif ($gwa <= 1.50 && $grades->count() > 0) {
            $standing = "Dean's Lister Candidate";
        }

        return response()->json([
            'status' => 'success',
            'total_units' => $totalUnits,
            'gwa' => $gwa,
            'academic_standing' => $standing,
            'grades' => $grades,
        ]);
    }
}