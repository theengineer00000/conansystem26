<?php

namespace App\Models;

class JobPositionModel
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
     * Get list of job positions for the current user's active company (non-archived)
     */
    public static function GetJobPositionList(int $page = 1, int $perPage = 10, string $search = ''): array
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
        $where = "j.company_id = :company_id AND COALESCE(j.is_archived, 0) = 0";
        if ($search !== '') {
            $where .= " AND j.name LIKE :kw";
            $params['kw'] = '%' . trim($search) . '%';
        }

        $totalRes = \DB::selectOne("SELECT COUNT(*) AS cnt FROM job_position j WHERE $where", $params);
        $total = (int) ($totalRes->cnt ?? 0);

        $query = "
            SELECT j.id, j.name, COALESCE(j.is_archived,0) AS is_archived,
                   CASE WHEN j.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END AS is_new
            FROM job_position j
            WHERE $where
            ORDER BY j.name COLLATE utf8mb4_unicode_ci
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
     * Archived job positions list
     */
    public static function GetArchivedJobPositionList(int $page = 1, int $perPage = 10, string $search = ''): array
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
        $where = "j.company_id = :company_id AND COALESCE(j.is_archived, 0) = 1";
        if ($search !== '') {
            $where .= " AND j.name LIKE :kw";
            $params['kw'] = '%' . trim($search) . '%';
        }

        $totalRes = \DB::selectOne("SELECT COUNT(*) AS cnt FROM job_position j WHERE $where", $params);
        $total = (int) ($totalRes->cnt ?? 0);

        $query = "
            SELECT j.id, j.name, COALESCE(j.is_archived,0) AS is_archived,
                   CASE WHEN j.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END AS is_new
            FROM job_position j
            WHERE $where
            ORDER BY j.name COLLATE utf8mb4_unicode_ci
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
    public static function GetJobPositionDetails(int $jobPositionId): array
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
            "SELECT j.* FROM job_position j WHERE j.id = :id AND j.company_id = :company_id LIMIT 1",
            ['id' => $jobPositionId, 'company_id' => $companyId]
        );
        if (!$row) return ['success' => false, 'message' => 'Not found'];
        return ['success' => true, 'data' => $row];
    }

    /** Create */
    public static function CreateJobPosition(array $data): array
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

        try {
            \DB::insert(
                "INSERT INTO job_position (company_id, name, created_at, updated_at) VALUES (:company_id, :name, NOW(), NOW())",
                ['company_id' => $companyId, 'name' => $data['name']]
            );
            $newId = (int) \DB::getPdo()->lastInsertId();
            return ['success' => true, 'id' => $newId];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /** Update */
    public static function UpdateJobPosition(int $jobPositionId, array $data): array
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

        // Ensure job position exists
        $exists = \DB::selectOne("SELECT id FROM job_position WHERE id = :id AND company_id = :company_id LIMIT 1", ['id' => $jobPositionId, 'company_id' => $companyId]);
        if (!$exists) return ['success' => false, 'message' => 'Not found'];

        if (empty($data['name'])) return ['success' => false, 'message' => 'Name is required'];

        try {
            \DB::update(
                "UPDATE job_position SET name = :name, updated_at = NOW() WHERE id = :id AND company_id = :company_id",
                ['name' => $data['name'], 'id' => $jobPositionId, 'company_id' => $companyId]
            );
            return ['success' => true];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /** Archive/Activate */
    public static function UpdateJobPositionStatus(int $jobPositionId, string $status): array
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

        $exists = \DB::selectOne("SELECT id FROM job_position WHERE id = :id AND company_id = :company_id LIMIT 1", ['id' => $jobPositionId, 'company_id' => $companyId]);
        if (!$exists) return ['success' => false, 'message' => 'Not found'];

        if ($status === 'deleted') {
            try {
                \DB::delete("DELETE FROM job_position WHERE id = :id AND company_id = :company_id", ['id' => $jobPositionId, 'company_id' => $companyId]);
                return ['success' => true];
            } catch (\Exception $e) {
                return ['success' => false, 'message' => $e->getMessage()];
            }
        }

        $isArchived = $status === 'archived' ? 1 : 0;
        try {
            \DB::update(
                "UPDATE job_position SET is_archived = :is_archived, updated_at = NOW() WHERE id = :id AND company_id = :company_id",
                ['is_archived' => $isArchived, 'id' => $jobPositionId, 'company_id' => $companyId]
            );
            return ['success' => true];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}

?>


