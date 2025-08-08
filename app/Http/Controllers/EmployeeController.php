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
}

?>

