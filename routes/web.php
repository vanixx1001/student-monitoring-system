<?php

use App\Http\Controllers\AuthController;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

// Public Guest Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

    // OTP Verification Endpoint
    Route::post('/send-otp', [AuthController::class, 'sendOtp'])->name('otp.send');
});

// Logout Route (Auth Protected)
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware(['auth', 'verified'])->group(function () {

    // DASHBOARD OVERVIEW (Executive Command Center)
    Route::get('/dashboard', function () {
        $user = Auth::user();

        // 1. Kung Professor ang naka-login
        if ($user->role === 'professor') {
            $subjects = Subject::with(['grades.student'])
                ->where('professor_id', $user->id)
                ->get();

            return Inertia::render('dashboard', [
                'auth' => ['user' => $user],
                'role' => 'professor',
                'subjects' => $subjects,
            ]);
        }

        // 2. Kung Student ang naka-login
        $grades = Grade::with('subject')
            ->where('student_id', $user->id)
            ->get();

        $totalUnits = 0;
        $totalWeightedPoints = 0;

        foreach ($grades as $grade) {
            $units = $grade->subject->units ?? 3;
            $totalUnits += $units;
            $totalWeightedPoints += ($grade->grade_point * $units);
        }

        $gwa = $totalUnits > 0 ? round($totalWeightedPoints / $totalUnits, 2) : 0.00;

        return Inertia::render('dashboard', [
            'auth' => ['user' => $user],
            'role' => 'student',
            'grades' => $grades,
            'gwa' => $gwa,
            'totalUnits' => $totalUnits,
        ]);
    })->name('dashboard');

    // ==========================================
    // PROFESSOR SPECIFIC ROUTES (MODULAR PAGES)
    // ==========================================
    Route::prefix('professor')->name('professor.')->group(function () {

        // 1. My Subjects Management List Page
        Route::get('/subjects', function () {
            $user = Auth::user();
            abort_if($user->role !== 'professor', 403);

            $subjects = Subject::with(['grades.student'])
                ->where('professor_id', $user->id)
                ->get();

            // Kunin ang lahat ng registered students para sa enrollment dropdown
            $allStudents = User::where('role', 'student')
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get();

            return Inertia::render('professor/subjects/index', [
                'auth' => ['user' => $user],
                'subjects' => $subjects,
                'allStudents' => $allStudents,
            ]);
        })->name('subjects.index');

        // 2. Class Masterlist & Detailed Grade Sheet Page
        Route::get('/subjects/{id}', function ($id) {
            $user = Auth::user();
            abort_if($user->role !== 'professor', 403);

            $subject = Subject::with(['grades.student'])
                ->where('professor_id', $user->id)
                ->findOrFail($id);

            return Inertia::render('professor/subjects/show', [
                'auth' => ['user' => $user],
                'subject' => $subject,
            ]);
        })->name('subjects.show');

        // 3. Performance & Grade Analytics Matrix Page
        Route::get('/analytics', function () {
            $user = Auth::user();
            abort_if($user->role !== 'professor', 403);

            $subjects = Subject::with(['grades.student'])
                ->where('professor_id', $user->id)
                ->get();

            return Inertia::render('professor/analytics/index', [
                'auth' => ['user' => $user],
                'subjects' => $subjects,
            ]);
        })->name('analytics.index');

        // 4. At-Risk Early Warning & Intervention Page
        Route::get('/at-risk', function () {
            $user = Auth::user();
            abort_if($user->role !== 'professor', 403);

            $subjects = Subject::with(['grades.student'])
                ->where('professor_id', $user->id)
                ->get();

            return Inertia::render('professor/students/at-risk', [
                'auth' => ['user' => $user],
                'subjects' => $subjects,
            ]);
        })->name('at-risk.index');

        // ==========================================
        // PROFESSOR FORM ACTIONS
        // ==========================================

        // Create Subject
        Route::post('/subjects/create', function (Request $request) {
            $validated = $request->validate([
                'subject_code' => 'required|string|max:20',
                'subject_name' => 'required|string|max:255',
                'units' => 'required|integer|min:1|max:6',
            ]);

            Subject::create([
                'subject_code' => strtoupper($validated['subject_code']),
                'subject_name' => $validated['subject_name'],
                'units' => $validated['units'],
                'professor_id' => Auth::id(),
            ]);

            return back()->with('success', 'Subject created successfully!');
        })->name('subjects.create');

        // Enroll Student
        Route::post('/subjects/enroll', function (Request $request) {
            // Suportahan kung 'email' man o 'student_email' ang ipasa ng form
            $email = $request->input('email') ?? $request->input('student_email');
            $request->merge(['email' => $email]);

            $validated = $request->validate([
                'subject_id' => 'required|exists:subjects,id',
                'email' => 'required|email|exists:users,email',
            ]);

            $student = User::where('email', $validated['email'])
                ->where('role', 'student')
                ->first();

            if (!$student) {
                return back()->withErrors(['email' => 'Walang nahanap na student account gamit ang email na ito.']);
            }

            Grade::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'subject_id' => $validated['subject_id'],
                ],
                [
                    'prelim' => 0,
                    'midterm' => 0,
                    'finals' => 0,
                    'raw_average' => 0,
                    'grade_point' => 5.00,
                    'remarks' => 'Incomplete',
                ]
            );

            return back()->with('success', 'Student enrolled successfully!');
        })->name('subjects.enroll');

        // Grade Encoding / Update
        Route::post('/grades/update', function (Request $request) {
            $validated = $request->validate([
                'student_id' => 'required|exists:users,id',
                'subject_id' => 'required|exists:subjects,id',
                'prelim' => 'required|numeric|min:0|max:100',
                'midterm' => 'required|numeric|min:0|max:100',
                'finals' => 'required|numeric|min:0|max:100',
            ]);

            $rawAvg = round(($validated['prelim'] + $validated['midterm'] + $validated['finals']) / 3, 2);

            $point = match (true) {
                $rawAvg >= 97.00 => 1.00,
                $rawAvg >= 94.00 => 1.25,
                $rawAvg >= 91.00 => 1.50,
                $rawAvg >= 88.00 => 1.75,
                $rawAvg >= 85.00 => 2.00,
                $rawAvg >= 82.00 => 2.25,
                $rawAvg >= 79.00 => 2.50,
                $rawAvg >= 76.00 => 2.75,
                $rawAvg >= 75.00 => 3.00,
                default => 5.00,
            };

            Grade::updateOrCreate(
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
                    'remarks' => $point <= 3.00 ? 'Passed' : 'Failed',
                ]
            );

            return back()->with('success', 'Grade updated successfully!');
        })->name('grades.update');
    });

});

require __DIR__ . '/settings.php';