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
        Schema::table('users', function (Blueprint $table) {
            // Add theme preference (0 = light, 1 = dark)
            $table->tinyInteger('theme')->default(0)->comment('0 = light, 1 = dark');
            
            // Add user language preference
            $table->string('user_lang', 2)->default('ar')->comment('User language preference (ar, en)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['theme', 'user_lang']);
        });
    }
};