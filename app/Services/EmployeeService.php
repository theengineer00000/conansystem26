<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\EmployeeModel;
use App\Services\R2Service;

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
            // Media
            'picture_file' => ['nullable', 'file', 'image', 'max:5120'], // up to 5MB
        ];

        // Localized messages and attribute names
        // Return translation KEYS to be translated on the frontend (i18next)
        $messages = [
            'full_name.regex' => 'validation.full_name_invalid',
            'phone.regex' => 'validation.phone_invalid',
            'national_id.regex' => 'validation.national_id_invalid',
            'hire_date.date_format' => 'validation.date_format_exact',
            'bank_account_number.regex' => 'validation.bank_account_number_invalid',
            'iban.regex' => 'validation.iban_invalid',
        ];
        $attributes = [
            'full_name' => __('validation.attributes.full_name'),
            'email' => __('validation.attributes.email'),
            'phone' => __('validation.attributes.phone'),
            'national_id' => __('validation.attributes.national_id'),
            'job_title' => __('validation.attributes.job_title'),
            'department_id' => __('validation.attributes.department'),
            'manager_id' => __('validation.attributes.manager'),
            'hire_date' => __('validation.attributes.hire_date'),
            'work_location' => __('validation.attributes.work_location'),
            'address' => __('validation.attributes.address'),
            'country' => __('validation.attributes.country'),
            'city' => __('validation.attributes.city'),
            'salary' => __('validation.attributes.salary'),
            'currency' => __('validation.attributes.currency'),
            'bank_name' => __('validation.attributes.bank_name'),
            'bank_account_number' => __('validation.attributes.bank_account_number'),
            'iban' => __('validation.attributes.iban'),
            'birth_date' => __('validation.attributes.birth_date'),
            'gender' => __('validation.attributes.gender'),
            'marital_status' => __('validation.attributes.marital_status'),
            'nationality' => __('validation.attributes.nationality'),
            'emergency_contact' => __('validation.attributes.emergency_contact'),
        ];

        $validator = Validator::make($request->all(), $rules, $messages, $attributes);

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

        // Handle optional profile picture upload to R2
        $pictureUrl = null;
        if ($request->hasFile('picture_file')) {
            $upload = R2Service::uploadToR2($request->file('picture_file'), 'employees/pictures');
            if ($upload['success'] && !empty($upload['url'])) {
                $pictureUrl = $upload['url'];
            }
        }

        if ($pictureUrl !== null) {
            $validated['picture_url'] = $pictureUrl;
        }

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
            // Media
            'picture_file' => ['nullable', 'file', 'image', 'max:5120'],
        ];

        // Localized messages and attribute names
        // Return translation KEYS to be translated on the frontend (i18next)
        $messages = [
            'full_name.regex' => 'validation.full_name_invalid',
            'phone.regex' => 'validation.phone_invalid',
            'national_id.regex' => 'validation.national_id_invalid',
            'hire_date.date_format' => 'validation.date_format_exact',
            'bank_account_number.regex' => 'validation.bank_account_number_invalid',
            'iban.regex' => 'validation.iban_invalid',
        ];
        $attributes = [
            'full_name' => __('validation.attributes.full_name'),
            'email' => __('validation.attributes.email'),
            'phone' => __('validation.attributes.phone'),
            'national_id' => __('validation.attributes.national_id'),
            'job_title' => __('validation.attributes.job_title'),
            'department_id' => __('validation.attributes.department'),
            'manager_id' => __('validation.attributes.manager'),
            'hire_date' => __('validation.attributes.hire_date'),
            'work_location' => __('validation.attributes.work_location'),
            'address' => __('validation.attributes.address'),
            'country' => __('validation.attributes.country'),
            'city' => __('validation.attributes.city'),
            'salary' => __('validation.attributes.salary'),
            'currency' => __('validation.attributes.currency'),
            'bank_name' => __('validation.attributes.bank_name'),
            'bank_account_number' => __('validation.attributes.bank_account_number'),
            'iban' => __('validation.attributes.iban'),
            'birth_date' => __('validation.attributes.birth_date'),
            'gender' => __('validation.attributes.gender'),
            'marital_status' => __('validation.attributes.marital_status'),
            'nationality' => __('validation.attributes.nationality'),
            'emergency_contact' => __('validation.attributes.emergency_contact'),
        ];

        $validator = Validator::make($request->all(), $rules, $messages, $attributes);

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

        // Optional profile picture upload to R2 with cleanup of old image
        $newUpload = null;
        $oldPictureUrl = null;
        if ($request->hasFile('picture_file')) {
            // Get current employee picture to delete after successful update
            $current = EmployeeModel::GetEmployeeDetails($employeeId);
            if (($current['success'] ?? false) && isset($current['data']->picture_url)) {
                $oldPictureUrl = (string) ($current['data']->picture_url ?? '');
            }
            $newUpload = R2Service::uploadToR2($request->file('picture_file'), 'employees/pictures');
            if ($newUpload['success'] && !empty($newUpload['url'])) {
                $validated['picture_url'] = $newUpload['url'];
            } else {
                return [
                    'success' => false,
                    'message' => $newUpload['message'] ?? 'Failed to upload picture',
                ];
            }
        }

        $result = EmployeeModel::UpdateEmployee($employeeId, $validated);

        // If update succeeded and a new image was uploaded, delete old image
        if ($result['success'] && $newUpload && !empty($oldPictureUrl)) {
            R2Service::deleteFromR2($oldPictureUrl);
        }
        // If update failed and a new image was uploaded, delete the newly uploaded image to avoid orphan files
        if (!$result['success'] && $newUpload && !empty($newUpload['path'])) {
            R2Service::deleteFromR2($newUpload['path']);
        }

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
        // Validate inputs at service level
        $employeeId = (int) $employeeId;
        $userId = (int) $userId;
        $role = (string) $role;
        $force = (bool) $force;

        if ($employeeId <= 0) {
            return ['success' => false, 'message' => 'Invalid employee id'];
        }
        if ($userId <= 0) {
            return ['success' => false, 'message' => 'Invalid user id'];
        }
        if (!in_array($role, ['manager', 'hr', 'employee'], true)) {
            $role = 'employee';
        }
        return EmployeeModel::LinkEmployeeToUser($employeeId, $userId, $role, $force);
    }
}

?>

