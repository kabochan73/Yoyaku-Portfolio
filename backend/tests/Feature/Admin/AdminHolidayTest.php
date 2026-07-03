<?php

namespace Tests\Feature\Admin;

use App\Events\ReservationUpdated;
use App\Mail\ReservationCancelledByHoliday;
use App\Models\Holiday;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminHolidayTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-07-01');
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_一般ユーザーは休日設定にアクセスできない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/admin/holidays');

        $response->assertForbidden();
    }

    public function test_休日一覧を日付順で取得できる(): void
    {
        $admin = $this->admin();
        Holiday::create(['date' => '2026-07-20']);
        Holiday::create(['date' => '2026-07-10']);

        $response = $this->actingAs($admin)->getJson('/api/admin/holidays');

        $response->assertOk();
        $response->assertJsonPath('0.date', '2026-07-10T00:00:00.000000Z');
        $response->assertJsonPath('1.date', '2026-07-20T00:00:00.000000Z');
    }

    public function test_予約がない日は休日として追加できる(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)->postJson('/api/admin/holidays', [
            'date' => '2026-07-15',
            'reason' => '臨時休業',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('holidays', ['date' => '2026-07-15 00:00:00', 'reason' => '臨時休業']);
    }

    public function test_予約がある日にforceなしで休日追加すると警告が返る(): void
    {
        $admin = $this->admin();
        $user = User::factory()->create();
        Reservation::create([
            'user_id' => $user->id,
            'date' => '2026-07-15',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => $user->name,
            'price' => 6000,
        ]);

        $response = $this->actingAs($admin)->postJson('/api/admin/holidays', [
            'date' => '2026-07-15',
        ]);

        $response->assertStatus(409);
        $response->assertJsonPath('warning', true);
        $response->assertJsonPath('count', 1);
        $this->assertDatabaseHas('reservations', ['status' => 'confirmed']);
        $this->assertDatabaseCount('holidays', 0);
    }

    public function test_forceありで休日追加すると予約がキャンセルされキャンセルメールが送られる(): void
    {
        Mail::fake();
        $admin = $this->admin();
        $user = User::factory()->create();
        $reservation = Reservation::create([
            'user_id' => $user->id,
            'date' => '2026-07-15',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => $user->name,
            'price' => 6000,
        ]);

        $response = $this->actingAs($admin)->postJson('/api/admin/holidays', [
            'date' => '2026-07-15',
            'reason' => '臨時休業',
            'force' => true,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'cancelled',
        ]);
        $this->assertDatabaseHas('holidays', ['date' => '2026-07-15 00:00:00']);
        Mail::assertQueued(ReservationCancelledByHoliday::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_休日追加時にReservationUpdatedイベントがbroadcastされる(): void
    {
        Event::fake([ReservationUpdated::class]);
        $admin = $this->admin();

        $this->actingAs($admin)->postJson('/api/admin/holidays', [
            'date' => '2026-07-15',
        ])->assertCreated();

        Event::assertDispatched(ReservationUpdated::class, function ($event) {
            return $event->date === '2026-07-15';
        });
    }

    public function test_同じ日付の休日は重複登録できない(): void
    {
        $admin = $this->admin();
        Holiday::create(['date' => '2026-07-15']);

        $response = $this->actingAs($admin)->postJson('/api/admin/holidays', [
            'date' => '2026-07-15',
        ]);

        $response->assertUnprocessable();
    }

    public function test_休日を削除できる(): void
    {
        $admin = $this->admin();
        $holiday = Holiday::create(['date' => '2026-07-15']);

        $response = $this->actingAs($admin)->deleteJson("/api/admin/holidays/{$holiday->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('holidays', ['id' => $holiday->id]);
    }

    public function test_休日削除時にReservationUpdatedイベントがbroadcastされる(): void
    {
        Event::fake([ReservationUpdated::class]);
        $admin = $this->admin();
        $holiday = Holiday::create(['date' => '2026-07-15']);

        $this->actingAs($admin)
            ->deleteJson("/api/admin/holidays/{$holiday->id}")
            ->assertOk();

        Event::assertDispatched(ReservationUpdated::class, function ($event) {
            return $event->date === '2026-07-15';
        });
    }
}
