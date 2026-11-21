<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_admin_can_login_and_receives_token(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@fastfood.test',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        $this->postJson('/api/login', [
            'email' => 'admin@fastfood.test',
            'password' => 'wrong-password',
        ])->assertStatus(422);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::where('email', 'staff@fastfood.test')->first();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/me');

        $response->assertOk()
            ->assertJsonPath('user.email', 'staff@fastfood.test')
            ->assertJsonPath('user.role', 'staff');
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::where('email', 'staff@fastfood.test')->first();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertCount(0, $user->tokens);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/me')->assertStatus(401);
    }
}