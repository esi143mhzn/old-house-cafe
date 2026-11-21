<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class KitchenController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    /**
     * Active kitchen queue: NEW + PREPARING orders, oldest first.
     */
    public function index(): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->active()
            ->with(['items.menu'])
            ->orderBy('created_at')
            ->get();

        return OrderResource::collection($orders);
    }

    /**
     * Advance an order through NEW -> PREPARING -> COMPLETED.
     *
     * Request body: { "status": "preparing" } or { "status": "completed" }
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:new,preparing,completed'],
        ]);

        // Kitchen can only advance the state of active orders.
        if (! $order->isActive() && $validated['status'] !== $order->status) {
            throw ValidationException::withMessages([
                'status' => ['This order is no longer in the active kitchen queue.'],
            ]);
        }

        $order = $this->orderService->changeStatus($order, $validated['status']);

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->order_number} marked as {$order->status}.",
            'data' => new OrderResource($order->load(['items.menu', 'staff'])),
        ]);
    }
}