<?php

namespace Tests\Feature\Admin;

use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_一般ユーザーはユーザー検索にアクセスできない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/admin/users?search=a');

        $response->assertForbidden();
    }

    public function test_検索語なしではエラーになる(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->getJson('/api/admin/users');

        $response->assertUnprocessable();
    }

    public function test_名前またはメールで部分一致検索できる(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $matchByName = User::factory()->create(['name' => 'taro-yamada', 'email' => 'yamada@example.com']);
        $matchByEmail = User::factory()->create(['name' => '鈴木一郎', 'email' => 'taro-suzuki@example.com']);
        User::factory()->create(['name' => '佐藤花子', 'email' => 'sato@example.com']);

        $response = $this->actingAs($admin)->getJson('/api/admin/users?search=taro');

        $response->assertOk();
        $response->assertJsonCount(2);
        $ids = collect($response->json())->pluck('id');
        $this->assertTrue($ids->contains($matchByName->id));
        $this->assertTrue($ids->contains($matchByEmail->id));
    }

    public function test_管理者自身は検索結果に含まれない(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'name' => '管理太郎']);

        $response = $this->actingAs($admin)->getJson('/api/admin/users?search=太郎');

        $response->assertOk();
        $response->assertJsonCount(0);
    }

    public function test_確定予約数がカウントされる(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['name' => '検索太郎']);
        Reservation::create([
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

        $response = $this->actingAs($admin)->getJson('/api/admin/users?search=検索太郎');

        $response->assertOk();
        $response->assertJsonPath('0.reservations_count', 1);
    }
}
