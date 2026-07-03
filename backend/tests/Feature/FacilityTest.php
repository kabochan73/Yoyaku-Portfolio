<?php

namespace Tests\Feature;

use App\Models\Price;
use App\Models\RegularHoliday;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FacilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_未認証でも料金一覧を取得できる(): void
    {
        Price::create(['type' => 'weekday', 'amount_per_hour' => 3000]);
        Price::create(['type' => 'weekend', 'amount_per_hour' => 4000]);

        $response = $this->getJson('/api/prices');

        $response->assertOk();
        $response->assertJsonCount(2);
    }

    public function test_未認証でも定休日一覧を取得できる(): void
    {
        RegularHoliday::create(['day_of_week' => 1]);

        $response = $this->getJson('/api/regular-holidays');

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.day_of_week', 1);
    }
}
