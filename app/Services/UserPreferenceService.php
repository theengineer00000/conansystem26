<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class UserPreferenceService
{
    /**
     * Validate and update user preferences (theme and language)
     *
     * @param array $data
     * @return array
     * @throws ValidationException
     */
    public function updatePreferences(array $data): array
    {
        $validator = Validator::make($data, [
            'theme' => 'required|integer|in:0,1',
            'user_lang' => 'required|string|size:2',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $userId = Auth::id();
        
        if (!$userId) {
            return [
                'success' => false,
                'message' => 'User not authenticated',
                'status' => 401
            ];
        }

        // Use the User model method to update preferences
        $updated = User::updateUserPreferences(
            $userId, 
            $data['theme'], 
            $data['user_lang']
        );
        
        if ($updated > 0) {
            // Force refresh the authenticated user instance
            Auth::user()->refresh();
        }
        
        return [
            'success' => $updated > 0,
            'message' => $updated > 0 ? 'User preferences updated successfully' : 'No changes made',
            'status' => 200
        ];
    }

    /**
     * Get the user's preferences
     * 
     * @return array
     */
    public function getPreferences(): array
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return [
                'success' => false,
                'message' => 'User not authenticated',
                'status' => 401
            ];
        }

        // Use the User model method
        $preferences = User::getUserPreferences($userId);
        
        return [
            'success' => true,
            'preferences' => $preferences,
            'status' => 200
        ];
    }
}