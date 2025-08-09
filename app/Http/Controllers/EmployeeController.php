<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\EmployeeService;
use App\Models\EmployeeModel;

class EmployeeController extends Controller
{
    public function CreateEmployee(Request $request)
    {
        $service = new EmployeeService();
        $result = $service->validateAndCreateEmployee($request);
        return response()->json($result);
    }

    public function GetEmployeeList(Request $request)
    {
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 10);
        $search = (string) $request->query('search', '');
        $newId = (int) $request->query('new_id', 0);
        $list = EmployeeModel::GetEmployeeList($page, $perPage, $search, $newId);
        return response()->json($list);
    }

    public function GetEmployeeDetails(int $employeeId)
    {
        $details = EmployeeModel::GetEmployeeDetails($employeeId);
        return response()->json($details);
    }

    public function UpdateEmployee(int $employeeId, Request $request)
    {
        $service = new EmployeeService();
        $result = $service->validateAndUpdateEmployee($request, $employeeId);
        // Ensure a friendly message always returned on failure
        if (!$result['success'] && !isset($result['message'])) {
            $result['message'] = 'Failed to update employee';
        }
        return response()->json($result);
    }

    public function UpdateEmployeeStatus(int $employeeId, Request $request)
    {
        $status = (string) $request->input('status', '');
        $password = (string) $request->input('password', '');
        $service = new EmployeeService();
        $result = $service->updateEmployeeStatus($employeeId, $status, $password);
        if (!$result['success'] && !isset($result['message'])) {
            $result['message'] = 'Failed to update employee status';
        }
        return response()->json($result);
    }

    public function LinkEmployeeToUser(int $employeeId, Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer'],
            'role' => ['nullable', 'in:manager,hr,employee'],
            'force' => ['nullable', 'boolean'],
        ]);
        $service = new EmployeeService();
        $role = (string)($validated['role'] ?? 'employee');
        $force = (bool)($validated['force'] ?? false);
        $result = $service->linkEmployeeToUser($employeeId, (int) $validated['user_id'], $role, $force);
        if (!$result['success'] && !isset($result['message'])) {
            $result['message'] = 'Failed to link employee to user';
        }
        return response()->json($result);
    }
}

?>

