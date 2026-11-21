<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_any_authenticated_user_can_list_menus(): void
    {
        $staff = User::where('email', 'staff@fastfood.test')->first();
        $admin = User::where('email', 'admin@fastfood.test')->first();

        $this->actingAs($staff, 'sanctum')->getJson('/api/menus')
            ->assertOk()
            ->assertJsonCount(5, 'data');

        $this->actingAs($admin, 'sanctum')->getJson('/api/menus')
            ->assertOk()
            ->assertJsonCount(5, 'data');
    }

    public function test_admin_can_create_update_and_delete_menu(): void
    {
        $admin = User::where('email', 'admin@fastfood.test')->first();

        $created = $this->actingAs($admin, 'sanctum')->postJson('/api/menus', [
            'name' => 'Pizza',
            'description' => 'A test item',
            'price' => 300,
            'is_available' => true,
        ])->assertStatus(201)->assertJsonPath('data.name', 'Pizza');

        $menuId = $created->json('data.id');

        $this->actingAs($admin, 'sanctum')->putJson("/api/menus/{$menuId}", [
            'price' => 350,
            'is_available' => false,
        ])->assertOk()->assertJsonPath('data.price', 350)->assertJsonPath('data.is_available', false);

        $this->actingAs($admin, 'sanctum')->deleteJson("/api/menus/{$menuId}")->assertOk();
        $this->assertDatabaseMissing('menus', ['id' => $menuId]);
    }

    public function test_staff_cannot_create_or_delete_menu(): void
    {
        $staff = User::where('email', 'staff@fastfood.test')->first();

        $this->actingAs($staff, 'sanctum')->postJson('/api/menus', [
            'name' => 'Pizza',
            'price' => 300,
        ])->assertStatus(403);

        $this->actingAs($staff, 'sanctum')->deleteJson('/api/menus/1')->assertStatus(403);
    }

    public function test_menu_validation(): void
    {
        $admin = User::where('email', 'admin@fastfood.test')->first();

        $this->actingAs($admin, 'sanctum')->postJson('/api/menus', [
            'name' => '',
            'price' => -5,
        ])->assertStatus(422);
    }

    public function test_unavailable_menu_cannot_be_ordered(): void
    {
        $admin = User::where('email', 'admin@fastfood.test')->first();
        $staff = User::where('email', 'staff@fastfood.test')->first();

        $this->actingAs($admin, 'sanctum')->putJson('/api/menus/1', ['is_available' => false])->assertOk();

        $this->actingAs($staff, 'sanctum')->postJson('/api/orders', [
            'order_type' => 'takeaway',
            'items' => [['menu_id' => 1, 'quantity' => 2]],
        ])->assertStatus(422);
    }
}