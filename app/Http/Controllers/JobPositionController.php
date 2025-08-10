<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JobPositionModel;

class JobPositionController extends Controller
{
    public function GetJobPositionList(Request $request)
    {
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 10);
        $search = (string) $request->query('search', '');
        $archived = (int) $request->query('archived', 0);
        if ($archived === 1) {
            $list = JobPositionModel::GetArchivedJobPositionList($page, $perPage, $search);
        } else {
            $list = JobPositionModel::GetJobPositionList($page, $perPage, $search);
        }
        return response()->json($list);
    }

    public function GetJobPositionDetails(int $jobPositionId)
    {
        $details = JobPositionModel::GetJobPositionDetails($jobPositionId);
        return response()->json($details);
    }

    public function CreateJobPosition(Request $request)
    {
        $data = $request->only(['name']);
        $res = JobPositionModel::CreateJobPosition($data);
        return response()->json($res);
    }

    public function UpdateJobPosition(int $jobPositionId, Request $request)
    {
        $data = $request->only(['name']);
        $res = JobPositionModel::UpdateJobPosition($jobPositionId, $data);
        return response()->json($res);
    }

    public function UpdateJobPositionStatus(int $jobPositionId, Request $request)
    {
        $status = (string) $request->input('status'); // archived | active | deleted
        $res = JobPositionModel::UpdateJobPositionStatus($jobPositionId, $status);
        return response()->json($res);
    }

    public function SearchEmployees(Request $request)
    {
        $q = (string) $request->query('q', '');
        $limit = (int) $request->query('limit', 20);
        if ($q === '') return response()->json(['success' => true, 'data' => []]);
        $data = JobPositionModel::SearchEmployeesByName($q, $limit);
        return response()->json(['success' => true, 'data' => $data]);
    }
}

?>

