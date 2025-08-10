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
    Route::get('/employees/list-archived', [\App\Http\Controllers\EmployeeController::class, 'GetArchivedEmployeeList']);
    Route::get('/employee/{employeeId}', [\App\Http\Controllers\EmployeeController::class, 'GetEmployeeDetails']);
    Route::post('/employee/update/{employeeId}', [\App\Http\Controllers\EmployeeController::class, 'UpdateEmployee']);
    Route::post('/employee/status/{employeeId}', [\App\Http\Controllers\EmployeeController::class, 'UpdateEmployeeStatus']);
    Route::post('/employee/link-user/{employeeId}', [\App\Http\Controllers\EmployeeController::class, 'LinkEmployeeToUser']);
    Route::get('/employees/search', [\App\Http\Controllers\DepartmentController::class, 'SearchEmployees']);

    // Department routes (API)
    Route::get('/departments/list', [\App\Http\Controllers\DepartmentController::class, 'GetDepartmentList']);
    Route::get('/department/{departmentId}', [\App\Http\Controllers\DepartmentController::class, 'GetDepartmentDetails']);
    Route::post('/department/create', [\App\Http\Controllers\DepartmentController::class, 'CreateDepartment']);
    Route::post('/department/update/{departmentId}', [\App\Http\Controllers\DepartmentController::class, 'UpdateDepartment']);
    Route::post('/department/status/{departmentId}', [\App\Http\Controllers\DepartmentController::class, 'UpdateDepartmentStatus']);

    // Employee pages (Inertia)
    Route::get('/employees', function () {
        return Inertia::render('employees/index');
    })->name('employees.index');
    Route::get('/employees/create', function () {
        return Inertia::render('employees/create');
    })->name('employees.create');
    Route::get('/employees/archived', function () {
        return Inertia::render('employees/archived');
    })->name('employees.archived');
    Route::get('/employees/details/{employeeId}', function ($employeeId) {
        return Inertia::render('employees/details', [
            'employeeId' => $employeeId,
        ]);
    })->name('employees.details');

    // Department pages (Inertia)
    Route::get('/departments', function () {
        return Inertia::render('departments/index');
    })->name('departments.index');
    Route::get('/departments/create', function () {
        return Inertia::render('departments/create');
    })->name('departments.create');
    Route::get('/departments/edit/{departmentId}', function ($departmentId) {
        return Inertia::render('departments/edit', [ 'departmentId' => $departmentId ]);
    })->name('departments.edit');
    Route::get('/departments/archived', function () {
        return Inertia::render('departments/archived');
    })->name('departments.archived');
    Route::get('/departments/details/{departmentId}', function ($departmentId) {
        return Inertia::render('departments/details', [ 'departmentId' => $departmentId ]);
    })->name('departments.details');
    
    // Job Positions Data Routes (provide both /api/* and non-/api paths)
    Route::get('/job-positions/list', [\App\Http\Controllers\JobPositionController::class, 'GetJobPositionList']);
    Route::get('/job-position/{jobPositionId}', [\App\Http\Controllers\JobPositionController::class, 'GetJobPositionDetails']);
    Route::post('/job-position/create', [\App\Http\Controllers\JobPositionController::class, 'CreateJobPosition']);
    Route::post('/job-position/update/{jobPositionId}', [\App\Http\Controllers\JobPositionController::class, 'UpdateJobPosition']);
    Route::post('/job-position/status/{jobPositionId}', [\App\Http\Controllers\JobPositionController::class, 'UpdateJobPositionStatus']);

    Route::get('/api/job-positions', [\App\Http\Controllers\JobPositionController::class, 'GetJobPositionList']);
    Route::get('/api/job-position/{jobPositionId}', [\App\Http\Controllers\JobPositionController::class, 'GetJobPositionDetails']);
    Route::post('/api/job-position/create', [\App\Http\Controllers\JobPositionController::class, 'CreateJobPosition']);
    Route::post('/api/job-position/update/{jobPositionId}', [\App\Http\Controllers\JobPositionController::class, 'UpdateJobPosition']);
    Route::post('/api/job-position/status/{jobPositionId}', [\App\Http\Controllers\JobPositionController::class, 'UpdateJobPositionStatus']);
    
    // Job Positions Pages
    Route::get('/job-positions', function () {
        return Inertia::render('job-positions/index');
    })->name('job-positions.index');
    Route::get('/job-positions/create', function () {
        return Inertia::render('job-positions/create');
    })->name('job-positions.create');
    Route::get('/job-positions/edit/{jobPositionId}', function ($jobPositionId) {
        return Inertia::render('job-positions/edit', [ 'jobPositionId' => $jobPositionId ]);
    })->name('job-positions.edit');
    Route::get('/job-positions/archived', function () {
        return Inertia::render('job-positions/archived');
    })->name('job-positions.archived');
    Route::get('/job-positions/details/{jobPositionId}', function ($jobPositionId) {
        return Inertia::render('job-positions/details', [ 'jobPositionId' => $jobPositionId ]);
    })->name('job-positions.details');
    
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
