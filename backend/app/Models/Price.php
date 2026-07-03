<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Price extends Model
{
    protected $fillable = ['type', 'amount_per_hour'];

    protected function casts(): array
    {
        return [
            'amount_per_hour' => 'integer',
        ];
    }
}
