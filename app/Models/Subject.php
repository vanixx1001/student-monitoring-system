<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_code',
        'subject_name',
        'units',
        'professor_id',
    ];

    public function professor()
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }
}