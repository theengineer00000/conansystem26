<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class EmployeeSeeder extends Seeder
{
    /**
     * Seed employees for an active company of an existing user.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Ensure at least one user exists
        $user = DB::table('users')->first();
        if (!$user) {
            $userId = DB::table('users')->insertGetId([
                'name' => 'Seed User',
                'email' => 'seed@example.com',
                'password' => bcrypt('password'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $user = DB::table('users')->where('id', $userId)->first();
        }

        // Target company: force to ID=6 (create it if missing)
        $companyId = 6;
        $company = DB::table('company')->where('id', $companyId)->first();
        if (!$company) {
            DB::table('company')->insert([
                'id' => $companyId,
                'name' => 'Company #6',
                'description' => 'Seeded company with fixed id = 6',
                'owner_user_id' => $user->id,
                'is_deleted' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Link user to company and set active
        $link = DB::table('company_user')
            ->where('company_id', $companyId)
            ->where('user_id', $user->id)
            ->first();
        if (!$link) {
            DB::table('company_user')->insert([
                'company_id' => $companyId,
                'user_id' => $user->id,
                'role' => 'manager',
                'active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('company_user')
                ->where('company_id', $companyId)
                ->where('user_id', $user->id)
                ->update(['active' => 1, 'updated_at' => now()]);
        }

        // Seed employees (idempotent-ish: ensure target count)
        $existingCount = (int) DB::table('employee')
            ->where('company_id', $companyId)
            ->where('is_deleted', 0)
            ->count();

        $target = 1000; // desired employees count
        $toCreate = max(0, $target - $existingCount);

        $batchSize = 200; // insert in chunks for performance
        while ($toCreate > 0) {
            $currentBatch = min($batchSize, $toCreate);
            $rows = [];
            for ($i = 0; $i < $currentBatch; $i++) {
                $fullName = $faker->name();
                $firstLetter = strtoupper(function_exists('mb_substr') ? mb_substr($fullName, 0, 1, 'UTF-8') : substr($fullName, 0, 1));
                $employeeCode = $companyId . '-' . $firstLetter . '-' . now()->format('YmdHis') . '-' . Str::random(4);

                $rows[] = [
                    'full_name' => $fullName,
                    'email' => $faker->unique()->safeEmail(),
                    'phone' => $faker->e164PhoneNumber(),
                    'national_id' => (string) $faker->unique()->numerify('##########'),
                    'employee_code' => $employeeCode,
                    'company_id' => $companyId,
                    'job_title' => $faker->randomElement(['Software Engineer', 'HR Specialist', 'Accountant', 'Sales Manager', 'Designer']),
                    'department_id' => null,
                    'manager_id' => null,
                    'hire_date' => $faker->date('Y-m-d', 'now'),
                    'work_location' => $faker->randomElement(['HQ', 'Remote', 'Branch']),
                    'address' => $faker->streetAddress(),
                    'country' => $faker->country(),
                    'city' => $faker->city(),
                    'salary' => $faker->randomFloat(2, 3000, 15000),
                    'currency' => 'usd',
                    'bank_name' => $faker->company(),
                    'bank_account_number' => strtoupper($faker->bothify('####-####-####-####')),
                    'iban' => strtoupper($faker->bothify('??##') . $faker->numerify('#######################')),
                    'birth_date' => $faker->date('Y-m-d', '-20 years'),
                    'gender' => $faker->randomElement(['male', 'female']),
                    'marital_status' => $faker->randomElement(['single', 'married']),
                    'nationality' => $faker->country(),
                    'emergency_contact' => $faker->name() . ' ' . $faker->phoneNumber(),
                    'is_active' => 1,
                    'is_deleted' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('employee')->insert($rows);
            $toCreate -= $currentBatch;
        }
    }
}


