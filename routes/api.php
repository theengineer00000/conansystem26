<?php

use App\Http\Controllers\UserPreferencesController;
use App\Http\Controllers\CompanyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// User preferences routes
Route::middleware('auth')->group(function () {
    Route::post('/user/preferences', [UserPreferencesController::class, 'updatePreferences']);
    
    // Company routes
});
