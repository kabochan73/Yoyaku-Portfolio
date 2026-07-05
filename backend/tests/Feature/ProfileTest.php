<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_名前とメールアドレスを変更できる(): void
    {
        $user = User::factory()->create(['name' => '太郎', 'email' => 'taro@example.com']);

        $response = $this->actingAs($user)->putJson('/api/profile', [
            'name' => '次郎',
            'email' => 'jiro@example.com',
        ]);

        $response->assertOk();
        $response->assertJsonFragment(['name' => '次郎', 'email' => 'jiro@example.com']);
        $this->assertSame('次郎', $user->fresh()->name);
    }

    public function test_現在のパスワードが正しければパスワードを変更できる(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password')]);

        $response = $this->actingAs($user)->putJson('/api/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'current_password' => 'old-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertOk();
        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
    }

    public function test_現在のパスワードが間違っているとパスワードを変更できない(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password')]);

        $response = $this->actingAs($user)->putJson('/api/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertUnprocessable();
        $this->assertTrue(Hash::check('old-password', $user->fresh()->password));
    }

    public function test_他人が使用中のメールアドレスには変更できない(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        $user = User::factory()->create(['email' => 'mine@example.com']);

        $response = $this->actingAs($user)->putJson('/api/profile', [
            'name' => $user->name,
            'email' => 'taken@example.com',
        ]);

        $response->assertUnprocessable();
    }

    public function test_未認証ではプロフィールを変更できない(): void
    {
        $response = $this->putJson('/api/profile', [
            'name' => '太郎',
            'email' => 'taro@example.com',
        ]);

        $response->assertUnauthorized();
    }
}
