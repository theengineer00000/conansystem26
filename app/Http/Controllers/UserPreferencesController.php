<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserPreferenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class UserPreferencesController extends Controller
{
    /**
     * @var UserPreferenceService
     */
    private $preferenceService;

    /**
     * UserPreferencesController constructor.
     *
     * @param UserPreferenceService $preferenceService
     */
    public function __construct(UserPreferenceService $preferenceService)
    {
        $this->preferenceService = $preferenceService;
    }

    /**
     * Update user preferences (theme and language).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $result = $this->preferenceService->updatePreferences($request->all());
        
        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
        ], $result['status']);
    }
    
    /**
     * Get the user's preferences.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPreferences(): JsonResponse
    {
        $result = $this->preferenceService->getPreferences();
        
        return response()->json([
            'success' => $result['success'],
            'preferences' => $result['preferences'] ?? null,
            'message' => $result['message'] ?? null,
        ], $result['status']);
    }
}