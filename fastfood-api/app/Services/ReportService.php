<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Resolve a date range from a period key or raw dates.
     *
     * @return array{from: Carbon, to: Carbon}
     */
    public function resolveRange(?string $period, ?string $dateFrom = null, ?string $dateTo = null): array
    {
        $today = Carbon::today();

        return match ($period) {
            'yesterday' => ['from' => $today->copy()->subDay()->startOfDay(), 'to' => $today->copy()->subDay()->endOfDay()],
            'week' => ['from' => $today->copy()->startOfWeek(), 'to' => $today->copy()->endOfDay()],
            'month' => ['from' => $today->copy()->startOfMonth(), 'to' => $today->copy()->endOfDay()],
            'custom' => [
                'from' => Carbon::parse($dateFrom ?: $today->toDateString())->startOfDay(),
                'to' => Carbon::parse($dateTo ?: $today->toDateString())->endOfDay(),
            ],
            default => ['from' => $today->copy()->startOfDay(), 'to' => $today->copy()->endOfDay()],
        };
    }

    /**
     * Sales summary for a date range.
     *
     * @return array<string, mixed>
     */
    public function salesSummary(array $range): array
    {
        [$from, $to] = array_values($range);

        $orders = Order::query()
            ->whereBetween('created_at', [$from, $to])
            ->with(['items'])
            ->get();

        $totalSales = (float) $orders->sum('total');
        $totalOrders = $orders->count();

        $cashSales = (float) $orders->where('payment_status', Order::PAYMENT_PAID)
            ->where('payment_method', Order::METHOD_CASH)
            ->sum('total');

        $qrSales = (float) $orders->where('payment_status', Order::PAYMENT_PAID)
            ->where('payment_method', Order::METHOD_QR)
            ->sum('total');

        $pending = (float) $orders->where('payment_status', Order::PAYMENT_PENDING)
            ->sum('total');

        $itemsSold = (int) $orders->flatMap->items->sum('quantity');

        $salesByItem = $orders->flatMap->items
            ->groupBy('menu_id')
            ->map(function (Collection $lines, $menuId) {
                $menu = Menu::query()->find($menuId);

                return [
                    'menu_id' => $menuId,
                    'menu_name' => $menu?->name ?? 'Deleted item',
                    'quantity_sold' => (int) $lines->sum('quantity'),
                    'revenue' => (float) $lines->sum('total'),
                ];
            })
            ->sortByDesc('quantity_sold')
            ->values()
            ->all();

        // Avoid division by zero.
        $averageOrderValue = $totalOrders > 0 ? round($totalSales / $totalOrders, 2) : 0;

        return [
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),
            'total_sales' => $totalSales,
            'total_orders' => $totalOrders,
            'cash_sales' => $cashSales,
            'qr_sales' => $qrSales,
            'pending_payments' => $pending,
            'items_sold' => $itemsSold,
            'average_order_value' => $averageOrderValue,
            'sales_by_item' => $salesByItem,
        ];
    }

    /**
     * Dashboard summary for today, plus popular items.
     *
     * @return array<string, mixed>
     */
    public function dashboardSummary(): array
    {
        $today = [Carbon::today()->startOfDay(), Carbon::today()->endOfDay()];

        $orders = Order::query()
            ->whereBetween('created_at', $today)
            ->get();

        $active = Order::query()->active()->count();

        $totalOrders = $orders->count();
        $totalSales = (float) $orders->sum('total');
        $completed = (int) $orders->where('status', Order::STATUS_COMPLETED)->count();
        $averageOrderValue = $totalOrders > 0 ? round($totalSales / $totalOrders, 2) : 0;

        $popularItemIds = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', $today)
            ->select('order_items.menu_id')
            ->selectRaw('SUM(order_items.quantity) as total_qty')
            ->groupBy('order_items.menu_id')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->pluck('total_qty', 'menu_id');

        $popularItems = [];
        foreach ($popularItemIds as $menuId => $qty) {
            $menu = Menu::query()->find($menuId);
            $popularItems[] = [
                'menu_id' => $menuId,
                'menu_name' => $menu?->name ?? 'Deleted item',
                'quantity_sold' => (int) $qty,
            ];
        }

        return [
            'today_orders' => $totalOrders,
            'today_sales' => $totalSales,
            'today_completed_orders' => $completed,
            'pending_kitchen_orders' => $active,
            'average_order_value' => $averageOrderValue,
            'popular_items' => $popularItems,
        ];
    }
}