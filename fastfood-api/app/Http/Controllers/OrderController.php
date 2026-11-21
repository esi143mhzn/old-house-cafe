<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    /**
     * List orders with optional filters.
     *
     * Query params:
     *  - date / date_from & date_to
     *  - status (new|preparing|completed)
     *  - payment_status (pending|paid)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::query()->with(['items.menu', 'staff']);

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->string('date')->toString());
        }

        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('created_at', [
                $request->string('date_from')->toString().' 00:00:00',
                $request->string('date_to')->toString().' 23:59:59',
            ]);
        } elseif ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->string('date_from')->toString());
        } elseif ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->string('date_to')->toString());
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->string('payment_status')->toString());
        }

        $orders = $query->orderByDesc('id')->paginate($request->integer('per_page', 15));

        return OrderResource::collection($orders);
    }

    /**
     * Create a new order and send it to the kitchen (status NEW).
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->createOrder(
                $request->validated(),
                $request->user()->id
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->order_number} sent to kitchen.",
            'data' => new OrderResource($order),
        ], 201);
    }

    /**
     * Show a single order with full detail.
     */
    public function show(Order $order): OrderResource
    {
        $order->load(['items.menu', 'staff']);

        return new OrderResource($order);
    }

    /**
     * Update an order (status transitions + payment recording).
     */
    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['payment_status']) && $data['payment_status'] === Order::PAYMENT_PAID) {
            $order = $this->orderService->recordPayment($order, $data['payment_method']);
        } elseif (isset($data['payment_status']) && $data['payment_status'] === Order::PAYMENT_PENDING) {
            $order->payment_status = Order::PAYMENT_PENDING;
            $order->payment_method = null;
            $order->save();
        }

        if (isset($data['status']) && $data['status'] !== $order->status) {
            $order = $this->orderService->changeStatus($order, $data['status']);
        }

        if (isset($data['order_type']) || array_key_exists('table_number', $data)) {
            $order->order_type = $data['order_type'] ?? $order->order_type;
            $order->table_number = $data['table_number'] ?? null;
            $order->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Order updated.',
            'data' => new OrderResource($order->fresh(['items.menu', 'staff'])),
        ]);
    }
}