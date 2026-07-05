<?php

namespace Database\Seeders;

use App\Models\Price;
use App\Models\RegularHoliday;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL')],
            [
                'name' => '管理者',
                'password' => Hash::make(env('ADMIN_PASSWORD')),
                'role' => 'admin',
            ]
        );

        Price::updateOrCreate(['type' => 'weekday'], ['amount_per_hour' => 4000]);
        Price::updateOrCreate(['type' => 'weekend'], ['amount_per_hour' => 5000]);

        // 月曜日を定休日（1 = Monday）
        RegularHoliday::updateOrCreate(['day_of_week' => 1]);
    }
}
