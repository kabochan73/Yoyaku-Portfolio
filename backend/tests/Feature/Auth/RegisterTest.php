<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_ユーザーを新規登録できる(): void
    {
        $response = $this->withHeader('Origin', 'http://localhost:3000')->postJson('/api/register', [
            'name' => 'テスト太郎',
            'email' => 'taro@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated();
        $response->assertJsonFragment([
            'name' => 'テスト太郎',
            'email' => 'taro@example.com',
            'role' => 'user',
        ]);
        $response->assertJsonMissing(['password']);

        $this->assertDatabaseHas('users', [
            'email' => 'taro@example.com',
            'role' => 'user',
        ]);

        $this->assertAuthenticated();
    }

    public function test_パスワード確認が一致しない場合は登録できない(): void
    {
        $response = $this->withHeader('Origin', 'http://localhost:3000')->postJson('/api/register', [
            'name' => 'テスト太郎',
            'email' => 'taro@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['password']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_既に登録済みのメールアドレスでは登録できない(): void
    {
        User::factory()->create(['email' => 'taro@example.com']);

        $response = $this->withHeader('Origin', 'http://localhost:3000')->postJson('/api/register', [
            'name' => 'テスト太郎',
            'email' => 'taro@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['email']);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_名前が20文字を超える場合は登録できない(): void
    {
        $response = $this->withHeader('Origin', 'http://localhost:3000')->postJson('/api/register', [
            'name' => str_repeat('あ', 21),
            'email' => 'taro@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['name']);
    }
}
