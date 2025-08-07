<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\CompanyModel;

class CompanyService
{
    public function validateAndCreateCompany(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);
        
        if ($validator->fails()) {
            return [
                'success' => false,
                'errors' => $validator->errors(),
            ];
        }
        
        $validated = $validator->validated();
        $userId = \Auth::id();
        
        $result = CompanyModel::CreateCompany(
            $validated['name'],
            $validated['description'] ?? null,
            $userId
        );
        
        return [
            'success' => $result,
        ];
    }
    
    public function validateAndUpdateCompany(Request $request, $companyId)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);
        
        if ($validator->fails()) {
            return [
                'success' => false,
                'errors' => $validator->errors(),
            ];
        }
        
        $validated = $validator->validated();
        
        $result = CompanyModel::UpdateCompany(
            $companyId,
            $validated['name'],
            $validated['description'] ?? null
        );
        
        return [
            'success' => $result,
        ];
    }
}

