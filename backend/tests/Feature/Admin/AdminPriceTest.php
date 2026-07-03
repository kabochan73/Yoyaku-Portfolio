<?php

namespace Tests\Feature\Admin;

use App\Models\Price;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPriceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Price::create(['type' => 'weekday', 'amount_per_hour' => 3000]);
        Price::create(['type' => 'weekend', 'amount_per_hour' => 4000]);
    }

    public function test_一般ユーザーは料金設定にアクセスできない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/admin/prices');

        $response->assertForbidden();
    }

    public function test_料金一覧を取得できる(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->getJson('/api/admin/prices');

        $response->assertOk();
        $response->assertJsonCount(2);
    }

    public function test_平日と週末の料金を更新できる(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->putJson('/api/admin/prices', [
            'weekday' => 3500,
            'weekend' => 4500,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('prices', ['type' => 'weekday', 'amount_per_hour' => 3500]);
        $this->assertDatabaseHas('prices', ['type' => 'weekend', 'amount_per_hour' => 4500]);
    }

    public function test_負の料金は指定できない(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->putJson('/api/admin/prices', [
            'weekday' => -100,
            'weekend' => 4500,
        ]);

        $response->assertUnprocessable();
    }
}
