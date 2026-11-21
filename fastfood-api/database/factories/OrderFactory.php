<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->numberBetween(120, 2000);
        $discount = 0;

        return [
            'order_number' => (string) $this->faker->unique()->numberBetween(1000, 99999),
            'order_type' => $this->faker->randomElement(['dine_in', 'takeaway']),
            'status' => 'new',
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => $subtotal - $discount,
            'payment_status' => 'pending',
            'payment_method' => null,
            'table_number' => null,
            'ordered_by' => User::factory()->create(['role' => 'staff'])->id,
        ];
    }
}