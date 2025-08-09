<?php

namespace App\Models;

class EmployeeModel
{
    /**
     * Create a new employee for the current user's active company
     *
     * @param array $data
     * @return array{success: bool, message?: string}
     */
    public static function CreateEmployee(array $data): array
    {
        $userId = \Auth::id();
        if (!$userId) {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        // Determine active company for current user
        $activeCompany = \DB::selectOne(
            "SELECT company_id FROM company_user WHERE user_id = :user_id AND active = 1 LIMIT 1",
            ['user_id' => $userId]
        );

        if (!$activeCompany || empty($activeCompany->company_id)) {
            return ['success' => false, 'message' => 'No active company selected'];
        }

        $companyId = (int) $activeCompany->company_id;

        // Generate unique employee code: {companyId}-{firstLetterOfNameUpper}-{timestamp}
        $firstLetter = '';
        if (!empty($data['full_name'])) {
            $firstLetterRaw = function_exists('mb_substr')
                ? mb_substr($data['full_name'], 0, 1, 'UTF-8')
                : substr($data['full_name'], 0, 1);
            $firstLetter = strtoupper($firstLetterRaw);
        }
        $employeeCode = $companyId . '-' . $firstLetter . '-' . date('YmdHis');

        // Optional manager validation: ensure manager belongs to same company if provided
        if (!empty($data['manager_id'])) {
            $manager = \DB::selectOne(
                "SELECT id FROM employee WHERE id = :manager_id AND company_id = :company_id AND is_deleted = 0 LIMIT 1",
                [
                    'manager_id' => $data['manager_id'],
                    'company_id' => $companyId,
                ]
            );
            if (!$manager) {
                return ['success' => false, 'message' => 'Invalid manager'];
            }
        }

        try {
            \DB::beginTransaction();

            // Normalize empty strings to null for nullable columns
            $nullableKeys = [
                'email','job_title','department_id','manager_id','work_location','address','country','city',
                'bank_name','bank_account_number','iban','birth_date','gender','marital_status','nationality','emergency_contact'
            ];
            foreach ($nullableKeys as $key) {
                if (array_key_exists($key, $data) && $data[$key] === '') {
                    $data[$key] = null;
                }
            }

            // Normalize empty strings to null for nullable columns
            $nullableKeys = [
                'email','job_title','department_id','manager_id','work_location','address','country','city',
                'currency','bank_name','bank_account_number','iban','birth_date','gender','marital_status','nationality','emergency_contact'
            ];
            foreach ($nullableKeys as $key) {
                if (array_key_exists($key, $data) && $data[$key] === '') {
                    $data[$key] = null;
                }
            }

            $query = "
                INSERT INTO employee (
                    full_name, email, phone, national_id,
                    employee_code, company_id, job_title, department_id, manager_id,
                    hire_date, work_location, address, country, city,
                    salary, currency, bank_name, bank_account_number, iban,
                    birth_date, gender, marital_status, nationality, emergency_contact
                ) VALUES (
                    :full_name, :email, :phone, :national_id,
                    :employee_code, :company_id, :job_title, :department_id, :manager_id,
                    :hire_date, :work_location, :address, :country, :city,
                    :salary, :currency, :bank_name, :bank_account_number, :iban,
                    :birth_date, :gender, :marital_status, :nationality, :emergency_contact
                )
            ";

            \DB::insert($query, [
                'full_name' => $data['full_name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'],
                'national_id' => $data['national_id'],
                'employee_code' => $employeeCode,
                'company_id' => $companyId,
                'job_title' => $data['job_title'] ?? null,
                'department_id' => $data['department_id'] ?? null,
                'manager_id' => $data['manager_id'] ?? null,
                'hire_date' => $data['hire_date'],
                'work_location' => $data['work_location'] ?? null,
                'address' => $data['address'] ?? null,
                'country' => $data['country'] ?? null,
                'city' => $data['city'] ?? null,
                'salary' => $data['salary'] ?? 0.00,
                'currency' => $data['currency'] ?? 'usd',
                'bank_name' => $data['bank_name'] ?? null,
                'bank_account_number' => $data['bank_account_number'] ?? null,
                'iban' => $data['iban'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'gender' => $data['gender'] ?? null,
                'marital_status' => $data['marital_status'] ?? null,
                'nationality' => $data['nationality'] ?? null,
                'emergency_contact' => $data['emergency_contact'] ?? null,
            ]);
            $newId = (int) \DB::getPdo()->lastInsertId();

            \DB::commit();
            return ['success' => true, 'id' => $newId];
        } catch (\Exception $e) {
            \DB::rollBack();
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get list of employees for the current user's active company
     *
     * @return array
     */
    public static function GetEmployeeList(int $page = 1, int $perPage = 10, string $search = '', int $newId = 0): array
    {
        $userId = \Auth::id();
        if (!$userId) {
            return ['data' => [], 'total' => 0, 'page' => $page, 'per_page' => $perPage, 'last_page' => 0];
        }

        $activeCompany = \DB::selectOne(
            "SELECT company_id FROM company_user WHERE user_id = :user_id AND active = 1 LIMIT 1",
            ['user_id' => $userId]
        );

        if (!$activeCompany || empty($activeCompany->company_id)) {
            return ['data' => [], 'total' => 0, 'page' => $page, 'per_page' => $perPage, 'last_page' => 0];
        }

        $companyId = (int) $activeCompany->company_id;

        $page = max(1, $page);
        $perPage = max(1, min(100, $perPage));
        $offset = ($page - 1) * $perPage;

        $searchLike = '%' . trim($search) . '%';

        // Build WHERE with optional search
        $where = "e.company_id = :company_id AND e.is_deleted = 0 AND (e.is_active = 1 OR e.is_suspended = 1)";
        $params = ['company_id' => $companyId];
        if ($search !== '') {
            $where .= " AND (e.full_name LIKE :kw1 OR e.email LIKE :kw2 OR e.phone LIKE :kw3 OR e.job_title LIKE :kw4)";
            $params['kw1'] = $searchLike;
            $params['kw2'] = $searchLike;
            $params['kw3'] = $searchLike;
            $params['kw4'] = $searchLike;
        }

        $totalResult = \DB::selectOne(
            "SELECT COUNT(*) AS cnt FROM employee e WHERE $where",
            $params
        );
        $total = (int) ($totalResult->cnt ?? 0);

        $query = "
            SELECT 
                e.id,
                e.full_name,
                e.email,
                e.phone,
                e.job_title,
                e.department_id,
                e.manager_id,
                e.hire_date,
                e.gender,
                e.is_active,
                e.is_suspended,
                e.is_deleted,
                e.is_archived
            FROM employee e
            WHERE $where
            ORDER BY e.full_name
            LIMIT $perPage OFFSET $offset
        ";

        // PDO does not support named params for LIMIT/OFFSET with DB::select in some drivers,
        // bind positionally to avoid issues
        $data = \DB::select($query, $params);

        $lastPage = $perPage > 0 ? (int) ceil($total / $perPage) : 0;

        // Mark newly created id if requested
        if ($newId > 0) {
            foreach ($data as &$row) {
                if ((int)($row->id ?? 0) === $newId) {
                    $row->is_new = 1;
                }
            }
        }

        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'last_page' => $lastPage,
        ];
    }

    /**
     * Get single employee details for current user's active company
     */
    public static function GetEmployeeDetails(int $employeeId): array
    {
        $userId = \Auth::id();
        if (!$userId) {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        $activeCompany = \DB::selectOne(
            "SELECT company_id FROM company_user WHERE user_id = :user_id AND active = 1 LIMIT 1",
            ['user_id' => $userId]
        );
        if (!$activeCompany || empty($activeCompany->company_id)) {
            return ['success' => false, 'message' => 'No active company selected'];
        }
        $companyId = (int) $activeCompany->company_id;

        $emp = \DB::selectOne(
            "SELECT * FROM employee WHERE id = :id AND company_id = :company_id AND is_deleted = 0 LIMIT 1",
            ['id' => $employeeId, 'company_id' => $companyId]
        );
        if (!$emp) {
            return ['success' => false, 'message' => 'Not found'];
        }
        return ['success' => true, 'data' => $emp];
    }

    /**
     * Update employee
     */
    public static function UpdateEmployee(int $employeeId, array $data): array
    {
        $userId = \Auth::id();
        if (!$userId) {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        $activeCompany = \DB::selectOne(
            "SELECT company_id FROM company_user WHERE user_id = :user_id AND active = 1 LIMIT 1",
            ['user_id' => $userId]
        );
        if (!$activeCompany || empty($activeCompany->company_id)) {
            return ['success' => false, 'message' => 'No active company selected'];
        }
        $companyId = (int) $activeCompany->company_id;

        // Ensure the employee exists and belongs to company
        $exists = \DB::selectOne(
            "SELECT id FROM employee WHERE id = :id AND company_id = :company_id AND is_deleted = 0 LIMIT 1",
            ['id' => $employeeId, 'company_id' => $companyId]
        );
        if (!$exists) {
            return ['success' => false, 'message' => 'Not found'];
        }

        // Optional manager validation: ensure manager belongs to same company if provided
        if (!empty($data['manager_id'])) {
            $manager = \DB::selectOne(
                "SELECT id FROM employee WHERE id = :manager_id AND company_id = :company_id AND is_deleted = 0 LIMIT 1",
                [
                    'manager_id' => $data['manager_id'],
                    'company_id' => $companyId,
                ]
            );
            if (!$manager) {
                return ['success' => false, 'message' => 'Invalid manager'];
            }
        }

        try {
            \DB::beginTransaction();
            // Normalize empty strings to null for nullable columns to avoid unique '' collisions
            $nullableKeys = [
                'email','job_title','department_id','manager_id','work_location','address','country','city',
                'currency','bank_name','bank_account_number','iban','birth_date','gender','marital_status','nationality','emergency_contact'
            ];
            foreach ($nullableKeys as $key) {
                if (array_key_exists($key, $data) && $data[$key] === '') {
                    $data[$key] = null;
                }
            }

            $query = "
                UPDATE employee SET
                    full_name = :full_name,
                    email = :email,
                    phone = :phone,
                    national_id = :national_id,
                    job_title = :job_title,
                    department_id = :department_id,
                    manager_id = :manager_id,
                    hire_date = :hire_date,
                    work_location = :work_location,
                    address = :address,
                    country = :country,
                    city = :city,
                    salary = :salary,
                    currency = :currency,
                    bank_name = :bank_name,
                    bank_account_number = :bank_account_number,
                    iban = :iban,
                    birth_date = :birth_date,
                    gender = :gender,
                    marital_status = :marital_status,
                    nationality = :nationality,
                    emergency_contact = :emergency_contact
                WHERE id = :id AND company_id = :company_id AND is_deleted = 0
            ";

            \DB::update($query, [
                'full_name' => $data['full_name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'],
                'national_id' => $data['national_id'],
                'job_title' => $data['job_title'] ?? null,
                'department_id' => $data['department_id'] ?? null,
                'manager_id' => $data['manager_id'] ?? null,
                'hire_date' => $data['hire_date'],
                'work_location' => $data['work_location'] ?? null,
                'address' => $data['address'] ?? null,
                'country' => $data['country'] ?? null,
                'city' => $data['city'] ?? null,
                'salary' => $data['salary'] ?? 0.00,
                'currency' => $data['currency'] ?? 'usd',
                'bank_name' => $data['bank_name'] ?? null,
                'bank_account_number' => $data['bank_account_number'] ?? null,
                'iban' => $data['iban'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'gender' => $data['gender'] ?? null,
                'marital_status' => $data['marital_status'] ?? null,
                'nationality' => $data['nationality'] ?? null,
                'emergency_contact' => $data['emergency_contact'] ?? null,
                'id' => $employeeId,
                'company_id' => $companyId,
            ]);

            \DB::commit();
            return ['success' => true];
        } catch (\Exception $e) {
            \DB::rollBack();
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Update employee single status flag ensuring mutual exclusivity
     */
    public static function UpdateEmployeeStatus(int $employeeId, string $status): array
    {
        $userId = \Auth::id();
        if (!$userId) {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        $activeCompany = \DB::selectOne(
            "SELECT company_id FROM company_user WHERE user_id = :user_id AND active = 1 LIMIT 1",
            ['user_id' => $userId]
        );
        if (!$activeCompany || empty($activeCompany->company_id)) {
            return ['success' => false, 'message' => 'No active company selected'];
        }
        $companyId = (int) $activeCompany->company_id;

        // Ensure employee exists
        $exists = \DB::selectOne(
            "SELECT id FROM employee WHERE id = :id AND company_id = :company_id LIMIT 1",
            ['id' => $employeeId, 'company_id' => $companyId]
        );
        if (!$exists) {
            return ['success' => false, 'message' => 'Not found'];
        }

        $flags = [
            'is_active' => 0,
            'is_suspended' => 0,
            'is_archived' => 0,
            'is_deleted' => 0,
        ];
        if ($status === 'active') $flags['is_active'] = 1;
        if ($status === 'suspended') $flags['is_suspended'] = 1;
        if ($status === 'archived') $flags['is_archived'] = 1;
        if ($status === 'deleted') $flags['is_deleted'] = 1;

        try {
            \DB::update(
                "UPDATE employee SET is_active = :is_active, is_suspended = :is_suspended, is_archived = :is_archived, is_deleted = :is_deleted WHERE id = :id AND company_id = :company_id",
                [
                    'is_active' => $flags['is_active'],
                    'is_suspended' => $flags['is_suspended'],
                    'is_archived' => $flags['is_archived'],
                    'is_deleted' => $flags['is_deleted'],
                    'id' => $employeeId,
                    'company_id' => $companyId,
                ]
            );
            return ['success' => true];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Link employee to a user: user_employee(user_id, employee_id UNIQUE)
     */
    public static function LinkEmployeeToUser(int $employeeId, int $userId, string $role = 'employee', bool $force = false): array
    {
        $userIdAuth = \Auth::id();
        if (!$userIdAuth) {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        // Ensure employee belongs to current active company
        $activeCompany = \DB::selectOne(
            "SELECT company_id FROM company_user WHERE user_id = :user_id AND active = 1 LIMIT 1",
            ['user_id' => $userIdAuth]
        );
        if (!$activeCompany || empty($activeCompany->company_id)) {
            return ['success' => false, 'message' => 'No active company selected'];
        }
        $companyId = (int) $activeCompany->company_id;

        $emp = \DB::selectOne(
            "SELECT id FROM employee WHERE id = :id AND company_id = :company_id AND is_deleted = 0 LIMIT 1",
            ['id' => $employeeId, 'company_id' => $companyId]
        );
        if (!$emp) {
            return ['success' => false, 'message' => 'Employee not found'];
        }

        // Check current link
        $existing = \DB::selectOne(
            "SELECT id, user_id FROM user_employee WHERE employee_id = :employee_id LIMIT 1",
            ['employee_id' => $employeeId]
        );
        if ($existing && !$force) {
            return ['success' => false, 'message' => 'Employee already linked to a user', 'code' => 'ALREADY_LINKED'];
        }

        // Ensure target user exists
        $targetUser = \DB::selectOne(
            "SELECT id FROM users WHERE id = :id LIMIT 1",
            ['id' => $userId]
        );
        if (!$targetUser) {
            return ['success' => false, 'message' => 'User not found'];
        }

        try {
            \DB::beginTransaction();
            if ($existing && $force) {
                // Move link
                \DB::update(
                    "UPDATE user_employee SET user_id = :user_id, updated_at = NOW() WHERE id = :id",
                    ['user_id' => $userId, 'id' => $existing->id]
                );
            } else {
                \DB::insert(
                    "INSERT INTO user_employee (user_id, employee_id, created_at, updated_at) VALUES (:user_id, :employee_id, NOW(), NOW())",
                    ['user_id' => $userId, 'employee_id' => $employeeId]
                );
            }

            // Ensure company_user row exists for this user and current company
            $existsCompanyUser = \DB::selectOne(
                "SELECT id FROM company_user WHERE user_id = :uid AND company_id = :cid LIMIT 1",
                ['uid' => $userId, 'cid' => $companyId]
            );
            if (!$existsCompanyUser) {
                \DB::insert(
                    "INSERT INTO company_user (user_id, company_id, role, active, created_at, updated_at) VALUES (:uid, :cid, :role, 0, NOW(), NOW())",
                    ['uid' => $userId, 'cid' => $companyId, 'role' => $role]
                );
            } else {
                // Update role to provided one
                \DB::update(
                    "UPDATE company_user SET role = :role, updated_at = NOW() WHERE id = :id",
                    ['role' => $role, 'id' => $existsCompanyUser->id]
                );
            }

            \DB::commit();
            return ['success' => true];
        } catch (\Exception $e) {
            \DB::rollBack();
            $msg = strtolower($e->getMessage());
            if (str_contains($msg, 'duplicate')) {
                return ['success' => false, 'message' => 'Employee already linked'];
            }
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}

?>

