<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\EmployeeModel;

class EmployeeService
{
    /**
     * Validate request and create a new employee
     *
     * Required fields: full_name, phone, national_id, hire_date
     * Optional fields are validated if present
     */
    public function validateAndCreateEmployee(Request $request): array
    {
        $rules = [
            // Basic Identity
            'full_name' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\'\.-]+$/u'], // letters, spaces, simple punctuation
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50', 'regex:/^[+\d\s\-()]+$/'], // digits, +, spaces, -, ()
            'national_id' => ['required', 'string', 'max:100', 'regex:/^\d+$/'],
            // Employment
            'job_title' => ['nullable', 'string', 'max:255'],
            'department_id' => ['nullable', 'integer'],
            'manager_id' => ['nullable', 'integer'],
            'hire_date' => ['required', 'date', 'date_format:Y-m-d'],
            // Location
            'work_location' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'country' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            // Financial
            'salary' => ['nullable', 'numeric'],
            'currency' => ['nullable', 'string', 'max:10'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9]+$/'],
            'iban' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9]+$/'],
            // Additional
            'birth_date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'gender' => ['nullable', 'in:male,female'],
            'marital_status' => ['nullable', 'string', 'max:50'],
            'nationality' => ['nullable', 'string', 'max:100', 'regex:/^[\p{L}\s\'-]+$/u'],
            'emergency_contact' => ['nullable', 'string'],
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            $errorsBag = $validator->errors();
            $firstMessage = '';
            foreach ($errorsBag->messages() as $field => $messages) {
                if (is_array($messages) && count($messages) > 0) {
                    $firstMessage = (string) $messages[0];
                    break;
                }
            }
            return [
                'success' => false,
                'errors' => $errorsBag,
                'message' => $firstMessage !== '' ? $firstMessage : 'Validation failed',
            ];
        }

        $validated = $validator->validated();

        $result = EmployeeModel::CreateEmployee($validated);

        // If DB unique constraint failed, try to parse and surface friendly messages
        if (!$result['success'] && isset($result['message']) && is_string($result['message'])) {
            $rawMessage = $result['message'];
            $message = strtolower($rawMessage);
            $errors = [];
            // Detect SQLSTATE duplicate entry (MySQL 1062)
            if (str_contains($message, 'duplicate entry') || str_contains($message, 'sqlstate[23000]') || str_contains($message, '1062')) {
                if (str_contains($message, 'email')) {
                    $errors['email'] = ['The email has already been taken.'];
                }
                if (str_contains($message, 'national_id')) {
                    $errors['national_id'] = ['The national id has already been taken.'];
                }
                if (str_contains($message, 'employee_code')) {
                    $errors['employee_code'] = ['The employee code has already been taken.'];
                }
            }
            // Fallback: keywords
            if (empty($errors)) {
                if (str_contains($message, 'email') && str_contains($message, 'unique')) {
                    $errors['email'] = ['The email has already been taken.'];
                }
                if (str_contains($message, 'national_id') && str_contains($message, 'unique')) {
                    $errors['national_id'] = ['The national id has already been taken.'];
                }
                if (str_contains($message, 'employee_code') && str_contains($message, 'unique')) {
                    $errors['employee_code'] = ['The employee code has already been taken.'];
                }
            }
            if (!empty($errors)) {
                $errorFields = implode(', ', array_keys($errors));
                return [
                    'success' => false,
                    'errors' => $errors,
                    'message' => $errorFields !== '' ? ('Duplicate value for: ' . $errorFields) : $rawMessage,
                ];
            }
        }

        return $result;
    }

    /**
     * Validate request and update an existing employee
     */
    public function validateAndUpdateEmployee(Request $request, int $employeeId): array
    {
        $rules = [
            // Basic Identity
            'full_name' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\'\.-]+$/u'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50', 'regex:/^[+\d\s\-()]+$/'],
            'national_id' => ['required', 'string', 'max:100', 'regex:/^\d+$/'],
            // Employment
            'job_title' => ['nullable', 'string', 'max:255'],
            'department_id' => ['nullable', 'integer'],
            'manager_id' => ['nullable', 'integer'],
            'hire_date' => ['required', 'date', 'date_format:Y-m-d'],
            // Location
            'work_location' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'country' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            // Financial
            'salary' => ['nullable', 'numeric'],
            'currency' => ['nullable', 'string', 'max:10'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9]+$/'],
            'iban' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9]+$/'],
            // Additional
            'birth_date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'gender' => ['nullable', 'in:male,female'],
            'marital_status' => ['nullable', 'string', 'max:50'],
            'nationality' => ['nullable', 'string', 'max:100', 'regex:/^[\p{L}\s\'-]+$/u'],
            'emergency_contact' => ['nullable', 'string'],
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            $errorsBag = $validator->errors();
            $firstMessage = '';
            foreach ($errorsBag->messages() as $field => $messages) {
                if (is_array($messages) && count($messages) > 0) {
                    $firstMessage = (string) $messages[0];
                    break;
                }
            }
            return [
                'success' => false,
                'errors' => $errorsBag,
                'message' => $firstMessage !== '' ? $firstMessage : 'Validation failed',
            ];
        }

        $validated = $validator->validated();

        $result = EmployeeModel::UpdateEmployee($employeeId, $validated);

        if (!$result['success'] && isset($result['message']) && is_string($result['message'])) {
            $rawMessage = $result['message'];
            $message = strtolower($rawMessage);
            $errors = [];
            if (str_contains($message, 'duplicate entry') || str_contains($message, 'sqlstate[23000]') || str_contains($message, '1062')) {
                if (str_contains($message, 'email')) {
                    $errors['email'] = ['The email has already been taken.'];
                }
                if (str_contains($message, 'national_id')) {
                    $errors['national_id'] = ['The national id has already been taken.'];
                }
                if (str_contains($message, 'employee_code')) {
                    $errors['employee_code'] = ['The employee code has already been taken.'];
                }
            }
            if (empty($errors)) {
                if (str_contains($message, 'email') && str_contains($message, 'unique')) {
                    $errors['email'] = ['The email has already been taken.'];
                }
                if (str_contains($message, 'national_id') && str_contains($message, 'unique')) {
                    $errors['national_id'] = ['The national id has already been taken.'];
                }
                if (str_contains($message, 'employee_code') && str_contains($message, 'unique')) {
                    $errors['employee_code'] = ['The employee code has already been taken.'];
                }
            }
            if (!empty($errors)) {
                $errorFields = implode(', ', array_keys($errors));
                return [
                    'success' => false,
                    'errors' => $errors,
                    'message' => $errorFields !== '' ? ('Duplicate value for: ' . $errorFields) : $rawMessage,
                ];
            }
        }

        return $result;
    }

    /**
     * Update employee status: active | suspended | archived | deleted
     * Only one of (is_active, is_suspended, is_archived, is_deleted) will be 1 at a time
     */
    public function updateEmployeeStatus(int $employeeId, string $status, string $password = ''): array
    {
        $status = strtolower(trim($status));
        $allowed = ['active', 'suspended', 'archived', 'deleted'];
        if (!in_array($status, $allowed, true)) {
            return ['success' => false, 'message' => 'Invalid status'];
        }

        // For destructive delete flag, require password confirmation
        if ($status === 'deleted') {
            if ($password === '') {
                return ['success' => false, 'message' => 'Password is required'];
            }
            $user = \Auth::user();
            if (!$user || !\Hash::check($password, $user->password)) {
                return ['success' => false, 'message' => 'Invalid password'];
            }
        }

        // Important destructive warning for deleted is handled on frontend via dialog
        return EmployeeModel::UpdateEmployeeStatus($employeeId, $status);
    }

    /**
     * Link employee to a user (one-to-one on employee side)
     */
    public function linkEmployeeToUser(int $employeeId, int $userId, string $role = 'employee', bool $force = false): array
    {
        if ($employeeId <= 0 || $userId <= 0) {
            return ['success' => false, 'message' => 'Invalid data'];
        }
        if (!in_array($role, ['manager', 'hr', 'employee'], true)) {
            $role = 'employee';
        }
        return EmployeeModel::LinkEmployeeToUser($employeeId, $userId, $role, $force);
    }
}

?>

