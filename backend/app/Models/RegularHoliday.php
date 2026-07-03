<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegularHoliday extends Model
{
    protected $fillable = ['day_of_week'];

    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
        ];
    }
}
