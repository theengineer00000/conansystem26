<?php

namespace App\Models;

class DepartmentModel
{
    /**
     * Search employees by full_name within current active company
     */
    public static function SearchEmployeesByName(string $query, int $limit = 20): array
    {
        $userId = \Auth::id();
        if (!$userId) {
            return [];
        }
        $activeCompany = \DB::selectOne(
            "SELECT company_id FROM company_user WHERE user_id = :user_id AND active = 1 LIMIT 1",
            ['user_id' => $userId]
        );
        if (!$activeCompany || empty($activeCompany->company_id)) {
            return [];
        }
        $companyId = (int) $activeCompany->company_id;
        $like = '%' . trim($query) . '%';
        $limit = max(1, min(100, (int) $limit));

        $sql = "
            SELECT e.id, e.full_name
            FROM employee e
            WHERE e.company_id = :company_id
              AND e.is_deleted = 0
              AND e.full_name LIKE :kw
            ORDER BY e.full_name COLLATE utf8mb4_unicode_ci
            LIMIT $limit
        ";

        return \DB::select($sql, [
            'company_id' => $companyId,
            'kw' => $like,
        ]);
    }
    /**
     * Get list of departments for the current user's active company (non-archived)
     */
    public static function GetDepartmentList(int $page = 1, int $perPage = 10, string $search = ''): array
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

        $params = ['company_id' => $companyId];
        $where = "d.company_id = :company_id AND COALESCE(d.is_archived, 0) = 0";
        if ($search !== '') {
            $where .= " AND d.name LIKE :kw";
            $params['kw'] = '%' . trim($search) . '%';
        }

        $totalRes = \DB::selectOne("SELECT COUNT(*) AS cnt FROM department d WHERE $where", $params);
        $total = (int) ($totalRes->cnt ?? 0);

        $query = "
            SELECT d.id, d.name, d.admin_id, COALESCE(d.is_archived,0) AS is_archived, e.full_name AS admin_name,
                   CASE WHEN d.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END AS is_new
            FROM department d
            LEFT JOIN employee e ON e.id = d.admin_id
            WHERE $where
            ORDER BY d.name COLLATE utf8mb4_unicode_ci
            LIMIT $perPage OFFSET $offset
        ";
        $data = \DB::select($query, $params);

        $lastPage = $perPage > 0 ? (int) ceil($total / $perPage) : 0;
        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'last_page' => $lastPage,
        ];
    }

    /**
     * Archived departments list
     */
    public static function GetArchivedDepartmentList(int $page = 1, int $perPage = 10, string $search = ''): array
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

        $params = ['company_id' => $companyId];
        $where = "d.company_id = :company_id AND COALESCE(d.is_archived, 0) = 1";
        if ($search !== '') {
            $where .= " AND d.name LIKE :kw";
            $params['kw'] = '%' . trim($search) . '%';
        }

        $totalRes = \DB::selectOne("SELECT COUNT(*) AS cnt FROM department d WHERE $where", $params);
        $total = (int) ($totalRes->cnt ?? 0);

        $query = "
            SELECT d.id, d.name, d.admin_id, COALESCE(d.is_archived,0) AS is_archived, e.full_name AS admin_name,
                   CASE WHEN d.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END AS is_new
            FROM department d
            LEFT JOIN employee e ON e.id = d.admin_id
            WHERE $where
            ORDER BY d.name COLLATE utf8mb4_unicode_ci
            LIMIT $perPage OFFSET $offset
        ";
        $data = \DB::select($query, $params);

        $lastPage = $perPage > 0 ? (int) ceil($total / $perPage) : 0;
        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'last_page' => $lastPage,
        ];
    }

    /** Get details */
    public static function GetDepartmentDetails(int $departmentId): array
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

        $row = \DB::selectOne(
            "SELECT d.*, e.full_name AS admin_name FROM department d LEFT JOIN employee e ON e.id = d.admin_id WHERE d.id = :id AND d.company_id = :company_id LIMIT 1",
            ['id' => $departmentId, 'company_id' => $companyId]
        );
        if (!$row) return ['success' => false, 'message' => 'Not found'];
        return ['success' => true, 'data' => $row];
    }

    /** Create */
    public static function CreateDepartment(array $data): array
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

        if (empty($data['name'])) return ['success' => false, 'message' => 'Name is required'];
        if (empty($data['admin_id'])) return ['success' => false, 'message' => 'Admin is required'];

        // Ensure admin_id is a valid employee in same company
        $admin = \DB::selectOne(
            "SELECT id FROM employee WHERE id = :id AND company_id = :company_id AND is_deleted = 0 LIMIT 1",
            ['id' => $data['admin_id'], 'company_id' => $companyId]
        );
        if (!$admin) return ['success' => false, 'message' => 'Invalid admin'];

        try {
            \DB::insert(
                "INSERT INTO department (company_id, name, admin_id, created_at, updated_at) VALUES (:company_id, :name, :admin_id, NOW(), NOW())",
                ['company_id' => $companyId, 'name' => $data['name'], 'admin_id' => $data['admin_id']]
            );
            $newId = (int) \DB::getPdo()->lastInsertId();
            return ['success' => true, 'id' => $newId];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /** Update */
    public static function UpdateDepartment(int $departmentId, array $data): array
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

        // Ensure department exists
        $exists = \DB::selectOne("SELECT id FROM department WHERE id = :id AND company_id = :company_id LIMIT 1", ['id' => $departmentId, 'company_id' => $companyId]);
        if (!$exists) return ['success' => false, 'message' => 'Not found'];

        if (empty($data['name'])) return ['success' => false, 'message' => 'Name is required'];
        if (empty($data['admin_id'])) return ['success' => false, 'message' => 'Admin is required'];

        $admin = \DB::selectOne("SELECT id FROM employee WHERE id = :id AND company_id = :company_id AND is_deleted = 0 LIMIT 1", ['id' => $data['admin_id'], 'company_id' => $companyId]);
        if (!$admin) return ['success' => false, 'message' => 'Invalid admin'];

        try {
            \DB::update(
                "UPDATE department SET name = :name, admin_id = :admin_id, updated_at = NOW() WHERE id = :id AND company_id = :company_id",
                ['name' => $data['name'], 'admin_id' => $data['admin_id'], 'id' => $departmentId, 'company_id' => $companyId]
            );
            return ['success' => true];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /** Archive/Activate */
    public static function UpdateDepartmentStatus(int $departmentId, string $status): array
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

        $exists = \DB::selectOne("SELECT id FROM department WHERE id = :id AND company_id = :company_id LIMIT 1", ['id' => $departmentId, 'company_id' => $companyId]);
        if (!$exists) return ['success' => false, 'message' => 'Not found'];

        if ($status === 'deleted') {
            try {
                \DB::delete("DELETE FROM department WHERE id = :id AND company_id = :company_id", ['id' => $departmentId, 'company_id' => $companyId]);
                return ['success' => true];
            } catch (\Exception $e) {
                return ['success' => false, 'message' => $e->getMessage()];
            }
        }

        $isArchived = $status === 'archived' ? 1 : 0;
        try {
            \DB::update(
                "UPDATE department SET is_archived = :is_archived, updated_at = NOW() WHERE id = :id AND company_id = :company_id",
                ['is_archived' => $isArchived, 'id' => $departmentId, 'company_id' => $companyId]
            );
            return ['success' => true];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}

?>


