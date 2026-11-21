<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuRequest;
use App\Http\Requests\UpdateMenuRequest;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MenuController extends Controller
{
    /**
     * List menu items. Staff only need available items for ordering,
     * admins need the full list for management.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Menu::query();

        // Optional filter: ?availability=available|unavailable
        if ($request->filled('availability')) {
            if ($request->string('availability')->toString() === 'available') {
                $query->available();
            } elseif ($request->string('availability')->toString() === 'unavailable') {
                $query->where('is_available', false);
            }
        }

        $menus = $query->orderBy('name')->get();

        return MenuResource::collection($menus);
    }

    /**
     * Show a single menu item.
     */
    public function show(Menu $menu): MenuResource
    {
        return new MenuResource($menu);
    }

    /**
     * Create a new menu item.
     */
    public function store(StoreMenuRequest $request): JsonResponse
    {
        $menu = Menu::query()->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Menu item created.',
            'data' => new MenuResource($menu),
        ], 201);
    }

    /**
     * Update a menu item.
     */
    public function update(UpdateMenuRequest $request, Menu $menu): JsonResponse
    {
        $menu->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated.',
            'data' => new MenuResource($menu->fresh()),
        ]);
    }

    /**
     * Delete a menu item.
     */
    public function destroy(Menu $menu): JsonResponse
    {
        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted.',
        ]);
    }
}