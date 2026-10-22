<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->decimal('prelim', 5, 2)->default(0);
            $table->decimal('midterm', 5, 2)->default(0);
            $table->decimal('finals', 5, 2)->default(0);
            $table->decimal('raw_average', 5, 2)->default(0); // 0 - 100 percentage
            $table->decimal('grade_point', 3, 2)->default(5.00); // 1.00 to 5.00 point system
            $table->enum('remarks', ['Passed', 'Failed', 'Incomplete', 'Dropped'])->default('Incomplete');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
