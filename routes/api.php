<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentGradeController;
use App\Http\Controllers\ProfessorGradeController;

// Public Route (Login)
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Kailangan ng Bearer Token mula kay Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Student API
    Route::get('/student/grades', [StudentGradeController::class, 'myGrades']);

    // Professor API
    Route::get('/professor/subjects', [ProfessorGradeController::class, 'getSubjects']);
    Route::post('/professor/subjects', [ProfessorGradeController::class, 'storeSubject']);
    Route::get('/professor/subject/{subjectId}/grades', [ProfessorGradeController::class, 'getSubjectGrades']);
    Route::post('/professor/grades/update', [ProfessorGradeController::class, 'updateGrade']);
});