<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'start_time',
        'end_time',
        'status',
        'booker_name',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'price' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }
}
