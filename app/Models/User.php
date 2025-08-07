<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;


    /**
     * Update user preferences
     *
     * @param int $userId
     * @param int $theme
     * @param string $user_lang
     * @return int
     */
    public static function updateUserPreferences($userId, $theme, $user_lang)
    {
        $query = "UPDATE users SET theme = ?, user_lang = ? WHERE id = ?";
        return \DB::update($query, [$theme, $user_lang, $userId]);
    }
    

    // fetch user preferences
    public static function getUserPreferences($userId)
    {
        $query = "SELECT theme, user_lang FROM users WHERE id = ?";
        return \DB::selectOne($query, [$userId]);
    }

    // fillable attributes
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_lang',
        'theme',
    ];

    // hidden attributes
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // casts attributes
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'theme' => 'integer', // Ensure theme is cast as integer
        ];
    }
}
