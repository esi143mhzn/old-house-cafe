<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with default users and menu items.
     */
    public function run(): void
    {
        // Default users -----------------------------------------------------------------
        User::query()->updateOrCreate(
            ['email' => 'admin@fastfood.test'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'staff@fastfood.test'],
            [
                'name' => 'Staff User',
                'password' => Hash::make('password'),
                'role' => 'staff',
            ]
        );

        // Initial menu items ------------------------------------------------------------
        $menu = [
            ['name' => 'Chicken Momo', 'description' => 'Steamed chicken dumplings served with spicy achar.', 'price' => 150],
            ['name' => 'Buff Momo', 'description' => 'Steamed buff dumplings served with spicy achar.', 'price' => 130],
            ['name' => 'Chowmein', 'description' => 'Stir-fried noodles with fresh vegetables.', 'price' => 140],
            ['name' => 'Burger', 'description' => 'Crispy chicken burger with lettuce and mayo.', 'price' => 180],
            ['name' => 'French Fries', 'description' => 'Golden crispy french fries with salt.', 'price' => 120],
        ];

        foreach ($menu as $item) {
            Menu::query()->updateOrCreate(
                ['name' => $item['name']],
                [
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'is_available' => true,
                ]
            );
        }
    }
}