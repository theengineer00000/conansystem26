<?php

namespace App\Models;


class CompanyModel
{

    // Get the list of companies for the current user
    public static function GetCompanyList()
    {
        $userId = \Auth::id();
        
        if (!$userId) {
            return [];
        }
        
        $query = "
            SELECT 
                company.id AS company_id,
                company.name AS company_name,
                company_user.active AS company_active,
                company_user.role AS company_role,
                CASE WHEN company.owner_user_id = :user_id THEN 1 ELSE 0 END AS is_owner
            FROM company
            JOIN company_user ON company_user.company_id = company.id
            WHERE company_user.user_id = :user_id_2
              AND company.is_deleted = 0

   ";
   
        return \DB::select($query, ['user_id' => $userId, 'user_id_2' => $userId]);

    }

    // Activate a company for the current user
    public static function ActivateCompany($companyId)
    {
        $userId = \Auth::id();
        
        if (!$userId || !$companyId) {
            return false;
        }
        
        // First deactivate all companies for this user
        $deactivateQuery = "
            UPDATE company_user
            SET active = 0
            WHERE user_id = :user_id
        ";
        \DB::update($deactivateQuery, ['user_id' => $userId]);
        
        // Then activate the selected company
        $activateQuery = "
            UPDATE company_user
            SET active = 1
            WHERE user_id = :user_id AND company_id = :company_id
        ";
        $result = \DB::update($activateQuery, [
            'user_id' => $userId,
            'company_id' => $companyId
        ]);
        
        return $result > 0;
    }

    // Delete a company for the current user
        public static function DeleteCompany($companyId)
    {
        $userId = \Auth::id();
        
        if (!$userId || !$companyId) {
            return false;
        }
        
        // Check if user is the owner of the company
        $checkOwnerQuery = "
            SELECT COUNT(*) AS count
            FROM company
            WHERE id = :company_id
              AND owner_user_id = :user_id
              AND is_deleted = 0
        ";
        
        $result = \DB::select($checkOwnerQuery, [
            'company_id' => $companyId,
            'user_id' => $userId
        ]);
        
        if (!$result || $result[0]->count == 0) {
            return false;
        }
        
        // Mark company as deleted
        $deleteQuery = "
            UPDATE company
            SET is_deleted = 1
            WHERE id = :company_id
              AND owner_user_id = :user_id
        ";
        
        $deleteResult = \DB::update($deleteQuery, [
            'company_id' => $companyId,
            'user_id' => $userId
        ]);

        $deactivateUsersQuery = "
            UPDATE company_user
            SET active = 0
            WHERE company_id = :company_id
        ";
        \DB::update($deactivateUsersQuery, [
            'company_id' => $companyId
        ]);
        
        return $deleteResult > 0;
    }

    // Create a new company and add the creator as owner
    public static function CreateCompany($name, $description, $ownerId)
    {
        if (!$name || !$ownerId) {
            return false;
        }
        
        try {
            \DB::beginTransaction();
            
            // Insert new company
            $insertCompanyQuery = "
                INSERT INTO company (name, description, owner_user_id)
                VALUES (:name, :description, :owner_id)
            ";
            
            \DB::insert($insertCompanyQuery, [
                'name' => $name,
                'description' => $description,
                'owner_id' => $ownerId
            ]);
            
            // Get the last inserted company ID
            $companyId = \DB::getPdo()->lastInsertId();
            
            // Add company-user relationship
            $insertCompanyUserQuery = "
                INSERT INTO company_user (company_id, user_id, role, active)
                VALUES (:company_id, :user_id, 'manager', 0)
            ";
            
            \DB::insert($insertCompanyUserQuery, [
                'company_id' => $companyId,
                'user_id' => $ownerId
            ]);
            
            \DB::commit();
            return true;
        } catch (\Exception $e) {
            \DB::rollBack();
            return false;
        }
    }
    
    // Get details of a specific company
    public static function GetCompanyDetails($companyId)
    {
        $userId = \Auth::id();
        
        if (!$userId || !$companyId) {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $query = "
            SELECT 
                company.id AS company_id,
                company.name AS company_name,
                company.description AS company_description,
                company.owner_user_id AS owner_user_id,
                CASE WHEN company.owner_user_id = :user_id THEN 1 ELSE 0 END AS is_owner
            FROM company
            JOIN company_user ON company_user.company_id = company.id
            WHERE company.id = :company_id
              AND company_user.user_id = :user_id_2
              AND company.is_deleted = 0
        ";
        
        $result = \DB::select($query, [
            'company_id' => $companyId, 
            'user_id' => $userId,
            'user_id_2' => $userId
        ]);
        
        if (empty($result)) {
            return ['success' => false, 'message' => 'Company not found or access denied'];
        }
        
        return ['success' => true, 'company' => $result[0]];
    }
    
    // Update company details (name and description)
    public static function UpdateCompany($companyId, $name, $description)
    {
        $userId = \Auth::id();
        
        if (!$userId || !$companyId || !$name) {
            return false;
        }
        
        // Check if user is the owner of the company
        $checkOwnerQuery = "
            SELECT COUNT(*) AS count
            FROM company
            WHERE id = :company_id
              AND owner_user_id = :user_id
              AND is_deleted = 0
        ";
        
        $result = \DB::select($checkOwnerQuery, [
            'company_id' => $companyId,
            'user_id' => $userId
        ]);
        
        if (!$result || $result[0]->count == 0) {
            return false;
        }
        
        // Update company details
        $updateQuery = "
            UPDATE company
            SET name = :name,
                description = :description
            WHERE id = :company_id
              AND owner_user_id = :user_id
        ";
        
        $updateResult = \DB::update($updateQuery, [
            'company_id' => $companyId,
            'user_id' => $userId,
            'name' => $name,
            'description' => $description
        ]);
        
        return $updateResult > 0;
    }
    
    // Get users associated with a specific company
    public static function GetCompanyUsers($companyId)
    {
        $userId = \Auth::id();
        
        if (!$userId || !$companyId) {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        // First check if the user has access to this company
        $checkAccessQuery = "
            SELECT 
                company_user.role AS user_role
            FROM company_user
            WHERE company_id = :company_id
              AND user_id = :user_id
        ";
        
        $accessCheck = \DB::select($checkAccessQuery, [
            'company_id' => $companyId,
            'user_id' => $userId
        ]);
        
        if (!$accessCheck || empty($accessCheck)) {
            return ['success' => false, 'message' => 'Access denied'];
        }
        
        $currentUserRole = $accessCheck[0]->user_role;
        
        // Get company details
        $companyQuery = "
            SELECT 
                company.id AS company_id,
                company.name AS company_name,
                company.description AS company_description
            FROM company
            WHERE company.id = :company_id
              AND company.is_deleted = 0
        ";
        
        $companyDetails = \DB::select($companyQuery, ['company_id' => $companyId]);
        
        if (empty($companyDetails)) {
            return ['success' => false, 'message' => 'Company not found'];
        }
        
        // Prepare SQL for users list based on current user's role
        if ($currentUserRole === 'manager' || $currentUserRole === 'hr') {
            // Manager and HR can see all users
            $query = "
                SELECT 
                    users.id AS user_id,
                    users.name AS user_name,
                    users.email AS user_email,
                    company_user.role AS user_role
                FROM company_user
                JOIN users ON users.id = company_user.user_id
                WHERE company_user.company_id = :company_id
                ORDER BY 
                    CASE 
                        WHEN company_user.role = 'manager' THEN 1
                        WHEN company_user.role = 'hr' THEN 2
                        ELSE 3
                    END,
                    users.name
            ";
            $users = \DB::select($query, ['company_id' => $companyId]);
        } else {
            // Regular employees can only see themselves
            $query = "
                SELECT 
                    users.id AS user_id,
                    users.name AS user_name,
                    users.email AS user_email,
                    company_user.role AS user_role
                FROM company_user
                JOIN users ON users.id = company_user.user_id
                WHERE company_user.company_id = :company_id
                  AND company_user.user_id = :user_id
            ";
            $users = \DB::select($query, [
                'company_id' => $companyId,
                'user_id' => $userId
            ]);
        }
        
        return [
            'success' => true, 
            'company' => $companyDetails[0],
            'users' => $users,
            'current_user_role' => $currentUserRole 
        ];
    }
}
