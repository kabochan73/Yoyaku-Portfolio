<?php

namespace Tests\Feature;

use App\Models\Price;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ReservationCalendarCacheTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-07-01');
        Cache::tags(['calendar'])->flush();

        Price::create(['type' => 'weekday', 'amount_per_hour' => 3000]);
        Price::create(['type' => 'weekend', 'amount_per_hour' => 4000]);
    }

    public function test_予約作成後にカレンダーキャッシュが更新される(): void
    {
        // カレンダーを一度取得してキャッシュを温める
        $before = $this->getJson('/api/calendar?month=2026-07');
        $before->assertJsonPath('2026-07-08.slots.10', 'available');

        $user = User::factory()->create();
        $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
        ])->assertCreated();

        $after = $this->getJson('/api/calendar?month=2026-07');
        $after->assertJsonPath('2026-07-08.slots.10', 'booked');
    }

    public function test_予約キャンセル後にカレンダーキャッシュが更新される(): void
    {
        $user = User::factory()->create();
        $reservation = Reservation::create([
            'user_id' => $user->id,
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => $user->name,
            'price' => 6000,
        ]);

        // カレンダーを一度取得してキャッシュを温める(bookedの状態)
        $before = $this->getJson('/api/calendar?month=2026-07');
        $before->assertJsonPath('2026-07-08.slots.10', 'booked');

        $this->actingAs($user)
            ->deleteJson("/api/reservations/{$reservation->id}")
            ->assertOk();

        $after = $this->getJson('/api/calendar?month=2026-07');
        $after->assertJsonPath('2026-07-08.slots.10', 'available');
    }
}
