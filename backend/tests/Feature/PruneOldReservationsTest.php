<?php

namespace Tests\Feature;

use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PruneOldReservationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-07-07');
    }

    public function test_3ヶ月より前の予約は削除される(): void
    {
        $old = Reservation::create([
            'date' => '2026-04-06', // 3ヶ月前の境界日より1日前
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => '古い予約',
            'price' => 6000,
        ]);

        $this->artisan('reservations:prune-old')->assertSuccessful();

        $this->assertDatabaseMissing('reservations', ['id' => $old->id]);
    }

    public function test_3ヶ月以内の予約は削除されない(): void
    {
        $recent = Reservation::create([
            'date' => '2026-04-07', // ちょうど3ヶ月前の境界日
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => '最近の予約',
            'price' => 6000,
        ]);

        $this->artisan('reservations:prune-old')->assertSuccessful();

        $this->assertDatabaseHas('reservations', ['id' => $recent->id]);
    }

    public function test_ステータスに関わらず古い予約は削除される(): void
    {
        $cancelled = Reservation::create([
            'date' => '2026-04-06',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'cancelled',
            'booker_name' => 'キャンセル済み',
            'price' => 6000,
        ]);

        $this->artisan('reservations:prune-old')->assertSuccessful();

        $this->assertDatabaseMissing('reservations', ['id' => $cancelled->id]);
    }
}
