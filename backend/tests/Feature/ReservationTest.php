<?php

namespace Tests\Feature;

use App\Mail\ReservationCancelled;
use App\Mail\ReservationConfirmed;
use App\Models\Holiday;
use App\Models\Price;
use App\Models\RegularHoliday;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-07-01'); // 水曜日

        Price::create(['type' => 'weekday', 'amount_per_hour' => 3000]);
        Price::create(['type' => 'weekend', 'amount_per_hour' => 4000]);
    }

    public function test_平日の予約は平日料金で計算される(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-08', // 水曜日
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertCreated();
        $response->assertJsonFragment(['price' => 6000]);
        $this->assertDatabaseHas('reservations', [
            'user_id' => $user->id,
            'status' => 'confirmed',
            'price' => 6000,
        ]);
    }

    public function test_週末の予約は週末料金で計算される(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-04', // 土曜日
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertCreated();
        $response->assertJsonFragment(['price' => 8000]);
    }

    public function test_1ヶ月より先の予約はできない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-08-05',
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('reservations', 0);
    }

    public function test_開始時刻が営業開始前だと予約できない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-08',
            'start_time' => '09:00',
            'end_time' => '11:00',
        ]);

        $response->assertUnprocessable();
    }

    public function test_終了時刻が営業終了後だと予約できない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-08',
            'start_time' => '21:00',
            'end_time' => '23:00',
        ]);

        $response->assertUnprocessable();
    }

    public function test_予約時間が2時間未満だとできない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '11:00',
        ]);

        $response->assertUnprocessable();
    }

    public function test_予約時間が4時間を超えるとできない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '15:00',
        ]);

        $response->assertUnprocessable();
    }

    public function test_定休日は予約できない(): void
    {
        RegularHoliday::create(['day_of_week' => Carbon::parse('2026-07-06')->dayOfWeek]);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-06',
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertUnprocessable();
    }

    public function test_臨時休業日は予約できない(): void
    {
        Holiday::create(['date' => '2026-07-08', 'reason' => '臨時休業']);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertUnprocessable();
    }

    public function test_同じ日に既に予約がある場合はできない(): void
    {
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

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-08',
            'start_time' => '14:00',
            'end_time' => '16:00',
        ]);

        $response->assertUnprocessable();
    }

    public function test_時間帯が重複する予約はできない(): void
    {
        $otherUser = User::factory()->create();
        Reservation::create([
            'user_id' => $otherUser->id,
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => $otherUser->name,
            'price' => 6000,
        ]);

        $user = User::factory()->create();
        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-08',
            'start_time' => '11:00',
            'end_time' => '13:00',
        ]);

        $response->assertUnprocessable();
    }

    public function test_未認証では予約できない(): void
    {
        $response = $this->postJson('/api/reservations', [
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertUnauthorized();
    }

    public function test_自分の確定予約のみ日付順で取得できる(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

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
            'user_id' => $otherUser->id,
            'date' => '2026-07-08',
            'start_time' => '14:00',
            'end_time' => '16:00',
            'status' => 'confirmed',
            'booker_name' => $otherUser->name,
            'price' => 6000,
        ]);

        $response = $this->actingAs($user)->getJson('/api/my-reservations');

        $response->assertOk();
        $response->assertJsonCount(2);
        $response->assertJsonPath('0.id', $earlier->id);
        $response->assertJsonPath('1.id', $later->id);
    }

    public function test_自分の予約をキャンセルできる(): void
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

        $response = $this->actingAs($user)->deleteJson("/api/reservations/{$reservation->id}");

        $response->assertOk();
        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_予約作成時に確認メールがキューに積まれる(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/reservations', [
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
        ])->assertCreated();

        Mail::assertQueued(ReservationConfirmed::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_予約キャンセル時にキャンセルメールがキューに積まれる(): void
    {
        Mail::fake();
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

        $this->actingAs($user)
            ->deleteJson("/api/reservations/{$reservation->id}")
            ->assertOk();

        Mail::assertQueued(ReservationCancelled::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_他人の予約はキャンセルできない(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $reservation = Reservation::create([
            'user_id' => $owner->id,
            'date' => '2026-07-08',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
            'booker_name' => $owner->name,
            'price' => 6000,
        ]);

        $response = $this->actingAs($other)->deleteJson("/api/reservations/{$reservation->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'confirmed',
        ]);
    }
}
