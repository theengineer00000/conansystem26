<?php

namespace App\Http\Controllers;
use App\Models\CompanyModel;
use App\Models\UserInviteModel;
use App\Services\CompanyService;
use Illuminate\Http\Request;


class CompanyController extends Controller
{

    public function GetCompanyList(Request $request)
    {
        $result = CompanyModel::GetCompanyList();
        return response()->json($result);
    }
    
    public function ActivateCompany(Request $request, $companyId)
    {
        $result = CompanyModel::ActivateCompany($companyId);
        return response()->json(['success' => $result]);
    }

    public function DeleteCompany(Request $request, $companyId)
    {
        $validated = $request->validate([
            'password' => ['required']
        ]);

        // Verify the password
        if (!\Hash::check($validated['password'], $request->user()->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid password'], 403);
        }

        $result = CompanyModel::DeleteCompany($companyId);
        return response()->json(['success' => $result]);
    }
    
    public function CreateCompany(Request $request)
    {
        $companyService = new CompanyService();
        $result = $companyService->validateAndCreateCompany($request);
        
        return response()->json($result);
    }
    
    public function GetCompanyDetails(Request $request, $companyId)
    {
        $result = CompanyModel::GetCompanyDetails($companyId);
        return response()->json($result);
    }
    
    public function UpdateCompany(Request $request, $companyId)
    {
        $companyService = new CompanyService();
        $result = $companyService->validateAndUpdateCompany($request, $companyId);
        
        return response()->json($result);
    }
    
    public function GetCompanyUsers(Request $request, $companyId)
    {
        $result = CompanyModel::GetCompanyUsers($companyId);
        return response()->json($result);
    }
    
    /**
     * Search for users by email
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function SearchUsersByEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string']
        ]);
        
        $users = UserInviteModel::findUsersByEmail($validated['email']);
        
        // If company ID provided, check for existing invites
        if ($request->has('company_id')) {
            $companyId = $request->input('company_id');
            foreach ($users as &$user) {
                $user->has_invite = UserInviteModel::hasExistingInvite($user->id, $companyId);
            }
        }
        
        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }
    
    /**
     * Send invites to users
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function SendUserInvites(Request $request)
    {
        $validated = $request->validate([
            'company_id' => ['required', 'numeric'],
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['numeric']
        ]);
        
        $sourceUserId = $request->user()->id;
        $result = UserInviteModel::createInvites(
            $sourceUserId, 
            $validated['user_ids'], 
            $validated['company_id']
        );
        
        return response()->json([
            'success' => $result
        ]);
    }

    /**
     * Get user invites
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function GetUserInvites(Request $request)
    {
        $userId = $request->user()->id;
        $invites = UserInviteModel::getUserInvites($userId);
        
        return response()->json([
            'success' => true,
            'invites' => $invites,
            'current_user_id' => $userId // إضافة معرف المستخدم الحالي للاستجابة
        ]);
    }

    /**
     * Accept an invitation
     * 
     * @param Request $request
     * @param int $inviteId
     * @return \Illuminate\Http\JsonResponse
     */
    public function AcceptInvite(Request $request, $inviteId)
    {
        $userId = $request->user()->id;
        $result = UserInviteModel::acceptInvite($inviteId, $userId);
        
        return response()->json([
            'success' => $result
        ]);
    }

    /**
     * Reject an invitation
     * 
     * @param Request $request
     * @param int $inviteId
     * @return \Illuminate\Http\JsonResponse
     */
    public function RejectInvite(Request $request, $inviteId)
    {
        $userId = $request->user()->id;
        $result = UserInviteModel::rejectInvite($inviteId, $userId);
        
        return response()->json([
            'success' => $result
        ]);
    }

    /**
     * Delete an invitation
     * 
     * @param Request $request
     * @param int $inviteId
     * @return \Illuminate\Http\JsonResponse
     */
    public function DeleteInvite(Request $request, $inviteId)
    {
        $userId = $request->user()->id;
        $result = UserInviteModel::deleteInvite($inviteId, $userId);
        
        return response()->json([
            'success' => $result
        ]);
    }
    
    /**
     * Check if user has any pending invites
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function HasPendingInvites(Request $request)
    {
        $userId = $request->user()->id;
        $hasPendingInvites = UserInviteModel::hasPendingInvites($userId);
        
        return response()->json([
            'success' => true,
            'has_pending_invites' => $hasPendingInvites
        ]);
    }
} 