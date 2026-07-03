<?php

namespace Tests\Feature;

use App\Models\Holiday;
use App\Models\RegularHoliday;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CalendarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // カレンダーAPIはRedisキャッシュを使うため、テスト間でキャッシュが残らないようにする
        Cache::tags(['calendar'])->flush();
    }

    public function test_monthパラメータが無いとエラーになる(): void
    {
        $response = $this->getJson('/api/calendar');

        $response->assertUnprocessable();
    }

    public function test_過去の日付は休業として返る(): void
    {
        Carbon::setTestNow('2026-07-15');

        $response = $this->getJson('/api/calendar?month=2026-07');

        $response->assertOk();
        $response->assertJson([
            '2026-07-01' => ['closed' => true, 'slots' => []],
        ]);
    }

    public function test_1ヶ月より先の日付は休業として返る(): void
    {
        Carbon::setTestNow('2026-07-15');

        $response = $this->getJson('/api/calendar?month=2026-08');

        $response->assertOk();
        $response->assertJson([
            '2026-08-20' => ['closed' => true, 'slots' => []],
        ]);
        $response->assertJsonPath('2026-08-15.closed', false);
    }

    public function test_定休日は休業として返る(): void
    {
        Carbon::setTestNow('2026-07-01');
        RegularHoliday::create(['day_of_week' => Carbon::parse('2026-07-06')->dayOfWeek]);

        $response = $this->getJson('/api/calendar?month=2026-07');

        $response->assertOk();
        $response->assertJson([
            '2026-07-06' => ['closed' => true, 'slots' => []],
        ]);
    }

    public function test_臨時休業日は休業として返る(): void
    {
        Carbon::setTestNow('2026-07-01');
        Holiday::create(['date' => '2026-07-10', 'reason' => '臨時休業']);

        $response = $this->getJson('/api/calendar?month=2026-07');

        $response->assertOk();
        $response->assertJson([
            '2026-07-10' => ['closed' => true, 'slots' => []],
        ]);
    }

    public function test_予約済みの時間帯はbookedとして返る(): void
    {
        Carbon::setTestNow('2026-07-01');
        $user = User::factory()->create();
        Reservation::create([
            'user_id' => $user->id,
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => $user->name,
            'price' => 6000,
        ]);

        $response = $this->getJson('/api/calendar?month=2026-07');

        $response->assertOk();
        $response->assertJsonPath('2026-07-08.slots.10', 'booked');
        $response->assertJsonPath('2026-07-08.slots.11', 'booked');
        $response->assertJsonPath('2026-07-08.slots.12', 'available');
    }

    public function test_キャンセル済みの予約はbookedにならない(): void
    {
        Carbon::setTestNow('2026-07-01');
        $user = User::factory()->create();
        Reservation::create([
            'user_id' => $user->id,
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'cancelled',
            'booker_name' => $user->name,
            'price' => 6000,
        ]);

        $response = $this->getJson('/api/calendar?month=2026-07');

        $response->assertOk();
        $response->assertJsonPath('2026-07-08.slots.10', 'available');
    }
}
