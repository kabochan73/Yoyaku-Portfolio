<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_正しい認証情報でログインできる(): void
    {
        $user = User::factory()->create([
            'email' => 'taro@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->withHeader('Origin', 'http://localhost:3000')->postJson('/api/login', [
            'email' => 'taro@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();
        $response->assertJsonFragment(['id' => $user->id]);
        $this->assertAuthenticatedAs($user);
    }

    public function test_誤ったパスワードではログインできない(): void
    {
        User::factory()->create([
            'email' => 'taro@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->withHeader('Origin', 'http://localhost:3000')->postJson('/api/login', [
            'email' => 'taro@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable();
        $this->assertGuest();
    }

    public function test_ログアウトするとセッションが無効になる(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withHeader('Origin', 'http://localhost:3000')
            ->postJson('/api/logout')
            ->assertOk();

        // auth:sanctumミドルウェアがデフォルトガードをsanctumに切り替え、
        // RequestGuardがユーザー解決結果をキャッシュするため、実体であるwebガードを明示する
        $this->assertGuest('web');
    }

    public function test_未ログインではユーザー情報を取得できない(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertUnauthorized();
    }

    public function test_ログイン中はユーザー情報を取得できる(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/user');

        $response->assertOk();
        $response->assertJsonFragment(['id' => $user->id]);
    }
}
