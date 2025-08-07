<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UserInviteModel extends Model
{
    // Table name
    protected $table = 'user_invites';

    /**
     * Create user invites
     *
     * @param int $sourceUserId - The user who is sending the invite
     * @param array $targetUserIds - Array of user IDs to invite
     * @param int $companyId - The company ID to invite to
     * @return bool
     */
    public static function createInvites($sourceUserId, $targetUserIds, $companyId)
    {
        $values = [];
        $bindings = [];

        foreach ($targetUserIds as $targetUserId) {
            // منع المستخدم من دعوة نفسه
            if ($sourceUserId == $targetUserId) {
                continue;
            }
            
            $values[] = "(?, ?, ?, ?)";
            array_push($bindings, $sourceUserId, $targetUserId, $companyId, 2); // 2 = pending status
        }

        if (empty($values)) {
            return false;
        }

        $query = "INSERT INTO user_invites (source_user_id, target_user_id, company_id, status) VALUES " . implode(", ", $values);
        
        return DB::insert($query, $bindings);
    }

    /**
     * Find users by email for invitation
     *
     * @param string $email
     * @return array
     */
    public static function findUsersByEmail($email)
    {
        $query = "SELECT id, name, email FROM users WHERE email LIKE ? LIMIT 5";
        return DB::select($query, ['%' . $email . '%']);
    }

    /**
     * Check if a user has a pending invite to a company
     *
     * @param int $userId
     * @param int $companyId
     * @return bool
     */
    public static function hasExistingInvite($userId, $companyId)
    {
        $query = "SELECT COUNT(*) as count FROM user_invites WHERE target_user_id = ? AND company_id = ? AND status = 2";
        $result = DB::selectOne($query, [$userId, $companyId]);
        
        return $result->count > 0;
    }

    /**
     * Get user invites where user is sender or receiver
     *
     * @param int $userId - The current user ID
     * @return array
     */
    public static function getUserInvites($userId)
    {
        $query = "
            SELECT 
                i.id,
                i.source_user_id,
                i.target_user_id,
                i.company_id,
                i.status,
                i.created_at,
                s.name as source_name,
                t.name as target_name,
                s.email as source_email,
                t.email as target_email,
                c.name as company_name
            FROM user_invites i
            JOIN users s ON i.source_user_id = s.id
            JOIN users t ON i.target_user_id = t.id
            JOIN company c ON i.company_id = c.id
            WHERE i.source_user_id = ? OR i.target_user_id = ?
            ORDER BY i.created_at DESC
        ";
        
        return DB::select($query, [$userId, $userId]);
    }

    /**
     * Accept an invitation
     *
     * @param int $inviteId - The invite ID
     * @param int $userId - The user accepting the invite (must be the target)
     * @return bool
     */
    public static function acceptInvite($inviteId, $userId)
    {
        // First verify this user is the target of this invite and it's in pending status
        $query = "SELECT * FROM user_invites WHERE id = ? AND target_user_id = ? AND status = 2";
        $invite = DB::selectOne($query, [$inviteId, $userId]);
        
        if (!$invite) {
            return false;
        }
        
        // Update the invite status to accepted (1)
        $updateQuery = "UPDATE user_invites SET status = 1 WHERE id = ?";
        $result = DB::update($updateQuery, [$inviteId]);
        
        if ($result) {
            // Add user to company (create a record in company_user table)
            $companyUsersQuery = "
                INSERT INTO company_user (company_id, user_id, role, active)
                VALUES (?, ?, 'employee', 0)
            ";
            
            DB::insert($companyUsersQuery, [$invite->company_id, $userId]);
        }
        
        return $result > 0;
    }

    /**
     * Reject an invitation
     *
     * @param int $inviteId - The invite ID
     * @param int $userId - The user rejecting the invite (must be the target)
     * @return bool
     */
    public static function rejectInvite($inviteId, $userId)
    {
        // First verify this user is the target of this invite and it's in pending status
        $query = "SELECT * FROM user_invites WHERE id = ? AND target_user_id = ? AND status = 2";
        $invite = DB::selectOne($query, [$inviteId, $userId]);
        
        if (!$invite) {
            return false;
        }
        
        // Update the invite status to rejected (0)
        $updateQuery = "UPDATE user_invites SET status = 0 WHERE id = ?";
        return DB::update($updateQuery, [$inviteId]) > 0;
    }

    /**
     * Delete an invitation
     *
     * @param int $inviteId - The invite ID
     * @param int $userId - The user deleting the invite (must be source or target)
     * @return bool
     */
    public static function deleteInvite($inviteId, $userId)
    {
        // First verify this user is related to this invite (source or target)
        $query = "SELECT * FROM user_invites WHERE id = ? AND (source_user_id = ? OR target_user_id = ?)";
        $invite = DB::selectOne($query, [$inviteId, $userId, $userId]);
        
        if (!$invite) {
            return false;
        }
        
        // Delete the invite
        $deleteQuery = "DELETE FROM user_invites WHERE id = ?";
        return DB::delete($deleteQuery, [$inviteId]) > 0;
    }
    
    /**
     * Check if user has any pending invites
     *
     * @param int $userId - The user ID
     * @return bool
     */
    public static function hasPendingInvites($userId)
    {
        $query = "SELECT COUNT(*) as count FROM user_invites WHERE target_user_id = ? AND status = 2";
        $result = DB::selectOne($query, [$userId]);
        
        return $result->count > 0;
    }
}