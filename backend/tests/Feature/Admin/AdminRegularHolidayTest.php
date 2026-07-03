<?php

namespace Tests\Feature\Admin;

use App\Models\RegularHoliday;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRegularHolidayTest extends TestCase
{
    use RefreshDatabase;

    public function test_一般ユーザーは定休日設定にアクセスできない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/admin/regular-holidays');

        $response->assertForbidden();
    }

    public function test_定休日一覧を曜日順で取得できる(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        RegularHoliday::create(['day_of_week' => 3]);
        RegularHoliday::create(['day_of_week' => 1]);

        $response = $this->actingAs($admin)->getJson('/api/admin/regular-holidays');

        $response->assertOk();
        $response->assertJsonPath('0.day_of_week', 1);
        $response->assertJsonPath('1.day_of_week', 3);
    }

    public function test_定休日を入れ替えて更新できる(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        RegularHoliday::create(['day_of_week' => 1]);

        $response = $this->actingAs($admin)->putJson('/api/admin/regular-holidays', [
            'days' => [0, 6],
        ]);

        $response->assertOk();
        $this->assertDatabaseMissing('regular_holidays', ['day_of_week' => 1]);
        $this->assertDatabaseHas('regular_holidays', ['day_of_week' => 0]);
        $this->assertDatabaseHas('regular_holidays', ['day_of_week' => 6]);
    }

    public function test_不正な曜日は指定できない(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->putJson('/api/admin/regular-holidays', [
            'days' => [7],
        ]);

        $response->assertUnprocessable();
    }
}
