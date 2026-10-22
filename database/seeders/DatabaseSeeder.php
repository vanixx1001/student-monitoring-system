<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Subject;
use App\Models\Grade;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Professor Account
        $prof = User::create([
            'name' => 'Prof. Alan Turing',
            'email' => 'prof@test.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'role' => 'professor',
        ]);

        // 2. Student Account
        $student = User::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'student@test.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'role' => 'student',
        ]);

        // 3. Subjects (Karaniwang ICCT BSIT / Computer Studies first year subjects)
        $sub1 = Subject::create([
            'subject_code' => 'IT101',
            'subject_name' => 'Introduction to Computing',
            'units' => 3,
            'professor_id' => $prof->id,
        ]);

        $sub2 = Subject::create([
            'subject_code' => 'IT102',
            'subject_name' => 'Computer Programming 1',
            'units' => 3,
            'professor_id' => $prof->id,
        ]);

        // 4. Sample Grades para kay Juan Dela Cruz
        // Subject 1: Maganda ang performance (1.50)
        Grade::create([
            'student_id' => $student->id,
            'subject_id' => $sub1->id,
            'prelim' => 92.00,
            'midterm' => 90.00,
            'finals' => 94.00,
            'raw_average' => 92.00,
            'grade_point' => 1.50,
            'remarks' => 'Passed',
        ]);

        // Subject 2: Medyo struggling pero pasado (2.75)
        Grade::create([
            'student_id' => $student->id,
            'subject_id' => $sub2->id,
            'prelim' => 78.00,
            'midterm' => 75.00,
            'finals' => 80.00,
            'raw_average' => 77.67,
            'grade_point' => 2.75,
            'remarks' => 'Passed',
        ]);
    }
}