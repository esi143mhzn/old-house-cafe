<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('order_type');                 // dine_in | takeaway
            $table->string('status')->default('new')->index();  // new | preparing | completed
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->string('payment_status')->default('pending')->index(); // pending | paid
            $table->string('payment_method')->nullable();  // cash | qr
            $table->string('table_number')->nullable();
            $table->foreignId('ordered_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['created_at']);
            $table->index(['status', 'payment_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};