<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\User;
use App\Models\Grade;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    /**
     * Ipakita ang listahan ng mga hawak na subjects at mga rehistradong estudyante
     */
    public function index(Request $request)
    {
        $subjects = Subject::with(['grades.student'])->get();

        // Kunin ang mga students
        $allStudents = User::where('role', 'student')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('professor/subjects/index', [
            'subjects' => $subjects,
            'allStudents' => $allStudents, // Siguraduhing nandito ito!
        ]);
    }

    /**
     * Mag-enroll ng estudyante sa kahit saang asignatura nang walang restriction
     */
    public function enrollStudent(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'email' => 'required|email|exists:users,email',
        ]);

        $student = User::where('email', $request->email)->first();

        // Tiyakin na may student role ang account
        if ($student->role !== 'student') {
            return back()->withErrors(['email' => 'Ang account na ito ay hindi nakarehistro bilang estudyante.']);
        }

        // Tiyakin na hindi pa naka-enroll sa parehong subject
        $alreadyEnrolled = Grade::where('subject_id', $request->subject_id)
            ->where('student_id', $student->id)
            ->exists();

        if ($alreadyEnrolled) {
            return back()->withErrors(['email' => 'Naka-enroll na ang estudyanteng ito sa klaseng ito.']);
        }

        // Lumikha ng record sa Grade model
        Grade::create([
            'subject_id' => $request->subject_id,
            'student_id' => $student->id,
            'prelim' => 0,
            'midterm' => 0,
            'finals' => 0,
            'raw_average' => 0,
            'grade_point' => 5.0,
            'remarks' => 'Failed',
        ]);

        return back()->with('success', 'Matagumpay na na-enroll ang estudyante sa naturang asignatura.');
    }
}