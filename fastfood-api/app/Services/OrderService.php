<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\Order;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OrderService
{
    /**
     * Create an order (status NEW, payment PENDING) together with its items
     * inside a single database transaction.
     *
     * @param  array{
     *     order_type: string,
     *     table_number?: string|null,
     *     discount?: float|int,
     *     items: array<int, array{menu_id: int, quantity: int}>
     * }  $data
     */
    public function createOrder(array $data, int $userId): Order
    {
        $menuIds = collect($data['items'])->pluck('menu_id')->unique();

        $menus = Menu::query()->whereIn('id', $menuIds)->get()->keyBy('id');

        // Validate every item references an existing, available menu entry.
        foreach ($data['items'] as $line) {
            $menu = $menus->get($line['menu_id']);
            if (! $menu) {
                throw new RuntimeException('One or more menu items are no longer available.');
            }
            if (! $menu->is_available) {
                throw new RuntimeException("{$menu->name} is currently unavailable.");
            }
        }

        $subtotal = round($this->computeSubtotal($menus, $data['items']), 2);
        $discount = round(min(max((float) ($data['discount'] ?? 0), 0), $subtotal), 2);
        $total = round($subtotal - $discount, 2);

        return DB::transaction(function () use ($data, $userId, $menus, $subtotal, $discount, $total) {
            $order = Order::query()->create([
                'order_number' => 'PENDING', // replaced after insert
                'order_type' => $data['order_type'],
                'status' => Order::STATUS_NEW,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'payment_status' => Order::PAYMENT_PENDING,
                'payment_method' => null,
                'table_number' => $data['table_number'] ?? null,
                'ordered_by' => $userId,
            ]);

            foreach ($data['items'] as $line) {
                $menu = $menus->get($line['menu_id']);
                $order->items()->create([
                    'menu_id' => $menu->id,
                    'quantity' => $line['quantity'],
                    'unit_price' => $menu->price,
                    'total' => round($menu->price * $line['quantity'], 2),
                ]);
            }

            // Unique sequential order number, e.g. #1042 (id 42 -> 1042).
            $order->order_number = (string) ($order->id + 1000);
            $order->save();

            return $order->load(['items.menu', 'staff']);
        });
    }

    /**
     * Compute the subtotal from menu prices and line quantities.
     */
    protected function computeSubtotal(Collection $menus, array $items): float
    {
        return collect($items)->reduce(function (float $carry, array $line) use ($menus) {
            $menu = $menus->get($line['menu_id']);

            return $carry + ((float) $menu->price * (int) $line['quantity']);
        }, 0.0);
    }

    /**
     * Record payment for an order.
     */
    public function recordPayment(Order $order, string $method): Order
    {
        $order->payment_status = Order::PAYMENT_PAID;
        $order->payment_method = $method;
        $order->save();

        return $order->load(['items.menu', 'staff']);
    }

    /**
     * Transition an order to a new status.
     */
    public function changeStatus(Order $order, string $status): Order
    {
        $order->status = $status;
        $order->save();

        return $order->load(['items.menu', 'staff']);
    }
}