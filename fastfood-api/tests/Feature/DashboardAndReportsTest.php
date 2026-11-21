<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardAndReportsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        $this->staff = User::where('email', 'staff@fastfood.test')->first();
        $this->admin = User::where('email', 'admin@fastfood.test')->first();

        // Build a couple of paid orders for today.
        $momo = Menu::where('name', 'Chicken Momo')->first();
        $fries = Menu::where('name', 'French Fries')->first();

        $orderCash = Order::create([
            'order_number' => '9001',
            'order_type' => 'dine_in',
            'status' => 'completed',
            'subtotal' => 420,
            'discount' => 0,
            'total' => 420,
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'ordered_by' => $this->staff->id,
        ]);
        OrderItem::create(['order_id' => $orderCash->id, 'menu_id' => $momo->id, 'quantity' => 2, 'unit_price' => 150, 'total' => 300]);
        OrderItem::create(['order_id' => $orderCash->id, 'menu_id' => $fries->id, 'quantity' => 1, 'unit_price' => 120, 'total' => 120]);

        $orderQr = Order::create([
            'order_number' => '9002',
            'order_type' => 'takeaway',
            'status' => 'new',
            'subtotal' => 130,
            'discount' => 0,
            'total' => 130,
            'payment_status' => 'paid',
            'payment_method' => 'qr',
            'ordered_by' => $this->staff->id,
        ]);
        OrderItem::create(['order_id' => $orderQr->id, 'menu_id' => 2, 'quantity' => 1, 'unit_price' => 130, 'total' => 130]);
    }

    public function test_dashboard_is_admin_only(): void
    {
        $this->actingAs($this->staff, 'sanctum')->getJson('/api/dashboard')->assertStatus(403);

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.today_orders', 2)
            ->assertJsonPath('data.today_sales', 550)
            ->assertJsonPath('data.pending_kitchen_orders', 1)
            ->assertJsonPath('data.average_order_value', 275);
    }

    public function test_reports_are_admin_only(): void
    {
        $this->actingAs($this->staff, 'sanctum')->getJson('/api/reports/sales?period=today')->assertStatus(403);
    }

    public function test_sales_report_today(): void
    {
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/reports/sales?period=today')
            ->assertOk()
            ->assertJsonPath('data.total_sales', 550)
            ->assertJsonPath('data.total_orders', 2)
            ->assertJsonPath('data.cash_sales', 420)
            ->assertJsonPath('data.qr_sales', 130)
            ->assertJsonPath('data.items_sold', 4)
            ->assertJsonCount(3, 'data.sales_by_item');
    }

    public function test_custom_date_range_requires_dates(): void
    {
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/reports/sales?period=custom')
            ->assertStatus(422);
    }

    public function test_popular_items_are_sorted_by_quantity(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/dashboard');
        $items = $response->json('data.popular_items');
        $this->assertSame('Chicken Momo', $items[0]['menu_name']);
    }
}