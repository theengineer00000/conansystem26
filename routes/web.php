<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // User preferences routes
    Route::get('user/preferences', [App\Http\Controllers\UserPreferencesController::class, 'getPreferences'])->name('user.preferences');
    Route::post('user/preferences', [App\Http\Controllers\UserPreferencesController::class, 'updatePreferences'])->name('user.preferences.update');

    // Company routes
    Route::get('/companylist', [\App\Http\Controllers\CompanyController::class, 'GetCompanyList']);
    Route::post('/company/activate/{companyId}', [\App\Http\Controllers\CompanyController::class, 'ActivateCompany']);
    Route::post('/company/delete/{companyId}', [\App\Http\Controllers\CompanyController::class, 'DeleteCompany']);
    Route::post('/company/create', [\App\Http\Controllers\CompanyController::class, 'CreateCompany']);
    Route::get('/company/{companyId}', [\App\Http\Controllers\CompanyController::class, 'GetCompanyDetails']);
    Route::post('/company/update/{companyId}', [\App\Http\Controllers\CompanyController::class, 'UpdateCompany']);
    Route::get('/company/{companyId}/users', [\App\Http\Controllers\CompanyController::class, 'GetCompanyUsers']);
    
    // User invite routes
    Route::post('/users/search', [\App\Http\Controllers\CompanyController::class, 'SearchUsersByEmail']);
    Route::post('/company/invites/send', [\App\Http\Controllers\CompanyController::class, 'SendUserInvites']);
    Route::get('/user/invites', [\App\Http\Controllers\CompanyController::class, 'GetUserInvites']);
    Route::get('/user/invites/pending', [\App\Http\Controllers\CompanyController::class, 'HasPendingInvites']);
    Route::post('/user/invites/accept/{inviteId}', [\App\Http\Controllers\CompanyController::class, 'AcceptInvite']);
    Route::post('/user/invites/reject/{inviteId}', [\App\Http\Controllers\CompanyController::class, 'RejectInvite']);
    Route::delete('/user/invites/delete/{inviteId}', [\App\Http\Controllers\CompanyController::class, 'DeleteInvite']);

    // Employee routes (API)
    Route::post('/employee/create', [\App\Http\Controllers\EmployeeController::class, 'CreateEmployee']);
    Route::get('/employees/list', [\App\Http\Controllers\EmployeeController::class, 'GetEmployeeList']);

    // Employee pages (Inertia)
    Route::get('/employees', function () {
        return Inertia::render('employees/index');
    })->name('employees.index');
    Route::get('/employees/create', function () {
        return Inertia::render('employees/create');
    })->name('employees.create');
    
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
