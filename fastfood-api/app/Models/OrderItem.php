<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_id',
        'menu_id',
        'quantity',
        'unit_price',
        'total',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'total' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }

    /**
     * The order this item belongs to.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * The menu entry this item was based on.
     */
    public function menu()
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }
}