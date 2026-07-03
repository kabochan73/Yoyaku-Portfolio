<?php

namespace Tests\Feature\Admin;

use App\Events\ReservationUpdated;
use App\Mail\ReservationCancelled;
use App\Models\Price;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminReservationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-07-01'); // 水曜日

        Price::create(['type' => 'weekday', 'amount_per_hour' => 3000]);
        Price::create(['type' => 'weekend', 'amount_per_hour' => 4000]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_一般ユーザーは管理者APIにアクセスできない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/admin/reservations?month=2026-07');

        $response->assertForbidden();
    }

    public function test_未認証では管理者APIにアクセスできない(): void
    {
        $response = $this->getJson('/api/admin/reservations?month=2026-07');

        $response->assertUnauthorized();
    }

    public function test_指定月の確定予約を日付順で取得できる(): void
    {
        $admin = $this->admin();
        $user = User::factory()->create();

        $later = Reservation::create([
            'user_id' => $user->id,
            'date' => '2026-07-10',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => $user->name,
            'price' => 6000,
        ]);
        $earlier = Reservation::create([
            'user_id' => $user->id,
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => $user->name,
            'price' => 6000,
        ]);
        Reservation::create([
            'user_id' => $user->id,
            'date' => '2026-07-09',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'cancelled',
            'booker_name' => $user->name,
            'price' => 6000,
        ]);
        Reservation::create([
            'user_id' => $user->id,
            'date' => '2026-08-01',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => $user->name,
            'price' => 6000,
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/reservations?month=2026-07');

        $response->assertOk();
        $response->assertJsonCount(2);
        $response->assertJsonPath('0.id', $earlier->id);
        $response->assertJsonPath('1.id', $later->id);
    }

    public function test_管理者は電話予約を代理登録できる(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)->postJson('/api/admin/reservations', [
            'date' => '2026-07-08', // 水曜日
            'start_time' => '10:00',
            'end_time' => '12:00',
            'booker_name' => '電話太郎',
        ]);

        $response->assertCreated();
        $response->assertJsonFragment(['price' => 6000]);
        $this->assertDatabaseHas('reservations', [
            'user_id' => null,
            'booker_name' => '電話太郎',
            'status' => 'confirmed',
            'price' => 6000,
        ]);
    }

    public function test_時間帯が重複する代理予約はできない(): void
    {
        $admin = $this->admin();
        Reservation::create([
            'user_id' => null,
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => '既存太郎',
            'price' => 6000,
        ]);

        $response = $this->actingAs($admin)->postJson('/api/admin/reservations', [
            'date' => '2026-07-08',
            'start_time' => '11:00',
            'end_time' => '13:00',
            'booker_name' => '電話太郎',
        ]);

        $response->assertUnprocessable();
    }

    public function test_代理予約作成時にReservationUpdatedイベントがbroadcastされる(): void
    {
        Event::fake([ReservationUpdated::class]);
        $admin = $this->admin();

        $this->actingAs($admin)->postJson('/api/admin/reservations', [
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'booker_name' => '電話太郎',
        ])->assertCreated();

        Event::assertDispatched(ReservationUpdated::class, function ($event) {
            return $event->date === '2026-07-08';
        });
    }

    public function test_管理者はユーザーの予約をキャンセルできキャンセルメールが送られる(): void
    {
        Mail::fake();
        $admin = $this->admin();
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

        $response = $this->actingAs($admin)->deleteJson("/api/admin/reservations/{$reservation->id}");

        $response->assertOk();
        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'cancelled',
        ]);
        Mail::assertQueued(ReservationCancelled::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_電話予約のキャンセルではメールが送られない(): void
    {
        Mail::fake();
        $admin = $this->admin();
        $reservation = Reservation::create([
            'user_id' => null,
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => '電話太郎',
            'price' => 6000,
        ]);

        $this->actingAs($admin)
            ->deleteJson("/api/admin/reservations/{$reservation->id}")
            ->assertOk();

        Mail::assertNothingQueued();
    }

    public function test_キャンセル時にReservationUpdatedイベントがbroadcastされる(): void
    {
        Event::fake([ReservationUpdated::class]);
        $admin = $this->admin();
        $reservation = Reservation::create([
            'user_id' => null,
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => '電話太郎',
            'price' => 6000,
        ]);

        $this->actingAs($admin)
            ->deleteJson("/api/admin/reservations/{$reservation->id}")
            ->assertOk();

        Event::assertDispatched(ReservationUpdated::class, function ($event) {
            return $event->date === '2026-07-08';
        });
    }
}
