<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DepartmentModel;
use App\Models\EmployeeModel;

class DepartmentController extends Controller
{
    public function GetDepartmentList(Request $request)
    {
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 10);
        $search = (string) $request->query('search', '');
        $archived = (int) $request->query('archived', 0);
        if ($archived === 1) {
            $list = DepartmentModel::GetArchivedDepartmentList($page, $perPage, $search);
        } else {
            $list = DepartmentModel::GetDepartmentList($page, $perPage, $search);
        }
        return response()->json($list);
    }

    public function GetDepartmentDetails(int $departmentId)
    {
        $details = DepartmentModel::GetDepartmentDetails($departmentId);
        return response()->json($details);
    }

    public function CreateDepartment(Request $request)
    {
        $data = $request->only(['name', 'admin_id']);
        $res = DepartmentModel::CreateDepartment($data);
        return response()->json($res);
    }

    public function UpdateDepartment(int $departmentId, Request $request)
    {
        $data = $request->only(['name', 'admin_id']);
        $res = DepartmentModel::UpdateDepartment($departmentId, $data);
        return response()->json($res);
    }

    public function UpdateDepartmentStatus(int $departmentId, Request $request)
    {
        $status = (string) $request->input('status'); // archived | active | deleted
        $res = DepartmentModel::UpdateDepartmentStatus($departmentId, $status);
        return response()->json($res);
    }

    public function SearchEmployees(Request $request)
    {
        $q = (string) $request->query('q', '');
        $limit = (int) $request->query('limit', 20);
        if ($q === '') return response()->json(['success' => true, 'data' => []]);
        $data = DepartmentModel::SearchEmployeesByName($q, $limit);
        return response()->json(['success' => true, 'data' => $data]);
    }
}

?>


