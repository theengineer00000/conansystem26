<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get('settings/company', function () {
        return Inertia::render('settings/company/index');
    })->name('settings.company');
    
    Route::get('settings/company/create', function () {
        return Inertia::render('settings/company/create/create');
    })->name('settings.company.create');
    
    Route::get('settings/company/edit/{companyId}', function ($companyId) {
        return Inertia::render('settings/company/edit/edit', [
            'companyId' => $companyId
        ]);
    })->name('settings.company.edit');
    
    Route::get('settings/company/details/{companyId}', function ($companyId) {
        return Inertia::render('settings/company/details/details', [
            'companyId' => $companyId
        ]);
    })->name('settings.company.details');
    
    Route::get('settings/company/invites', function () {
        return Inertia::render('settings/company/invites');
    })->name('settings.company.invites');
});
