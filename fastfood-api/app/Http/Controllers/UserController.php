<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * List users used by the admin Users screen.
     */
    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(User::query()->orderBy('name')->get());
    }

    /**
     * Create a user.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::query()->create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'role' => $request->validated('role'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created.',
            'data' => new UserResource($user),
        ], 201);
    }

    /**
     * Update a user.
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'User updated.',
            'data' => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Delete a user (an admin cannot delete their own account).
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted.',
        ]);
    }
}