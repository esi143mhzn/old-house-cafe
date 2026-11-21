<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_staff_can_create_order_with_items(): void
    {
        $staff = User::where('email', 'staff@fastfood.test')->first();

        $response = $this->actingAs($staff, 'sanctum')->postJson('/api/orders', [
            'order_type' => 'dine_in',
            'table_number' => '4',
            'discount' => 10,
            'items' => [
                ['menu_id' => 1, 'quantity' => 2], // Chicken Momo 150 x2 = 300
                ['menu_id' => 5, 'quantity' => 1], // French Fries 120 x1 = 120
            ],
        ])->assertCreated()->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.subtotal', 420)
            ->assertJsonPath('data.discount', 10)
            ->assertJsonPath('data.total', 410)
            ->assertJsonPath('data.ordered_by', $staff->id);

        $order = Order::where('id', $response->json('data.id'))->first();
        $this->assertCount(2, $order->items);
        $this->assertSame('1001', $order->order_number);
        $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'menu_id' => 1, 'quantity' => 2]);
    }

    public function test_order_requires_at_least_one_item(): void
    {
        $staff = User::where('email', 'staff@fastfood.test')->first();

        $this->actingAs($staff, 'sanctum')->postJson('/api/orders', [
            'order_type' => 'takeaway',
            'items' => [],
        ])->assertStatus(422);
    }

    public function test_kitchen_status_workflow(): void
    {
        $staff = User::where('email', 'staff@fastfood.test')->first();
        $order = Order::factory()->create(['ordered_by' => $staff->id]);

        // NEW -> PREPARING
        $this->actingAs($staff, 'sanctum')->putJson("/api/kitchen/orders/{$order->id}/status", [
            'status' => 'preparing',
        ])->assertOk()->assertJsonPath('data.status', 'preparing');

        // PREPARING -> COMPLETED
        $this->actingAs($staff, 'sanctum')->putJson("/api/kitchen/orders/{$order->id}/status", [
            'status' => 'completed',
        ])->assertOk()->assertJsonPath('data.status', 'completed');

        // Completed orders leave the kitchen queue.
        $this->actingAs($staff, 'sanctum')->getJson('/api/kitchen/orders')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_completed_order_cannot_return_to_kitchen(): void
    {
        $staff = User::where('email', 'staff@fastfood.test')->first();
        $order = Order::factory()->create(['ordered_by' => $staff->id, 'status' => 'completed']);

        $this->actingAs($staff, 'sanctum')->putJson("/api/kitchen/orders/{$order->id}/status", [
            'status' => 'preparing',
        ])->assertStatus(422);
    }

    public function test_staff_can_record_payment(): void
    {
        $staff = User::where('email', 'staff@fastfood.test')->first();
        $order = Order::factory()->create(['ordered_by' => $staff->id]);

        $this->actingAs($staff, 'sanctum')->putJson("/api/orders/{$order->id}", [
            'payment_status' => 'paid',
            'payment_method' => 'cash',
        ])->assertOk()->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.payment_method', 'cash');
    }

    public function test_paid_payment_requires_method(): void
    {
        $staff = User::where('email', 'staff@fastfood.test')->first();
        $order = Order::factory()->create(['ordered_by' => $staff->id]);

        $this->actingAs($staff, 'sanctum')->putJson("/api/orders/{$order->id}", [
            'payment_status' => 'paid',
        ])->assertStatus(422);
    }

    public function test_order_filters(): void
    {
        $staff = User::where('email', 'staff@fastfood.test')->first();

        Order::factory()->create(['ordered_by' => $staff->id, 'status' => 'completed']);
        Order::factory()->create(['ordered_by' => $staff->id, 'status' => 'new', 'payment_status' => 'paid']);

        $this->actingAs($staff, 'sanctum')->getJson('/api/orders?status=completed')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($staff, 'sanctum')->getJson('/api/orders?payment_status=paid')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}