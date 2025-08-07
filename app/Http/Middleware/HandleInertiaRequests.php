<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => Auth::check() ? [
                    'id' => Auth::user()->id,
                    'name' => Auth::user()->name,
                    'email' => Auth::user()->email,
                    'theme' => Auth::user()->theme,
                    'user_lang' => Auth::user()->user_lang,
                    'has_active_company' => $this->userHasActiveCompany(),
                ] : null,
            ],
        ]);
    }
    
    private function userHasActiveCompany(): bool
    {
        if (!Auth::check()) {
            return false;
        }
        
        $userId = Auth::id();
        $query = "
            SELECT COUNT(*) as count
            FROM company_user
            WHERE user_id = :user_id
            AND active = 1
        ";
        
        $result = DB::selectOne($query, ['user_id' => $userId]);
        return $result && $result->count > 0;
    }
}
