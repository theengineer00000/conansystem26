<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Drivers\Imagick\Driver as ImagickDriver;
use Intervention\Image\Encoders\WebpEncoder;

class R2Service
{
    /**
     * Upload a file to Cloudflare R2 in the given folder inside the bucket and return a public URL.
     *
     * The file must be an instance of UploadedFile or an absolute local file path.
     * The folder is a path inside the bucket (e.g. "avatars", "documents/2025").
     *
     * Returns an array structure:
     * [
     *   'success' => bool,
     *   'url' => string|null,          // Full public URL
     *   'path' => string|null,         // Object key inside the bucket
     *   'filename' => string|null,
     *   'message' => string|null,
     * ]
     */
    public static function uploadToR2(UploadedFile|string $file, string $folder = '', bool $convertToWebp = true): array
    {
        try {

    
            $disk = Storage::disk('r2');
            $normalizedFolder = trim($folder, "/ ");
            $directoryPrefix = $normalizedFolder !== '' ? ($normalizedFolder . '/') : '';
    
            if ($file instanceof UploadedFile) {
                $extension = $file->getClientOriginalExtension();
                $baseName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $safeBase = Str::slug($baseName);
                $uniqueSuffix = date('YmdHis') . '_' . Str::random(8);
                $finalFileName = ($safeBase ?: 'file') . '_' . $uniqueSuffix . ($extension ? ('.' . $extension) : '');
                $originalSize = $file->getSize();
                $content = $file->get();
                $mime = $file->getClientMimeType();
            } else {
                $extension = pathinfo($file, PATHINFO_EXTENSION);
                $baseName = pathinfo($file, PATHINFO_FILENAME);
                $safeBase = Str::slug($baseName);
                $uniqueSuffix = date('YmdHis') . '_' . Str::random(8);
                $finalFileName = ($safeBase ?: 'file') . '_' . $uniqueSuffix . ($extension ? ('.' . $extension) : '');
                $originalSize = filesize($file);
                $content = file_get_contents($file);
                $mime = mime_content_type($file);
            }
    
            $objectKey = $directoryPrefix . $finalFileName;
            $visibilityOptions = ['visibility' => 'public'];
    
            $chosenBytes = $content; 
            $chosenName  = $finalFileName;
    
            if ($convertToWebp && str_starts_with(strtolower($mime), 'image/')) {
                $driver = extension_loaded('imagick') ? new ImagickDriver() : new GdDriver();
                $manager = new ImageManager($driver);
                $image = $manager->read($content);
    
                $maxWidth = (int) (env('R2_MAX_WIDTH', 0));
                $maxHeight = (int) (env('R2_MAX_HEIGHT', 0));
                if ($maxWidth > 0 || $maxHeight > 0) {
                    $image = $image->scaleDown(
                        width: $maxWidth > 0 ? $maxWidth : null,
                        height: $maxHeight > 0 ? $maxHeight : null
                    );
                }
    
                $quality = (int) env('R2_WEBP_QUALITY', 70);
                $webpBytes = $image->encode(new WebpEncoder(quality: $quality));
                $webpName = pathinfo($finalFileName, PATHINFO_FILENAME) . '.webp';
    
                $jpgQuality = (int) env('R2_JPG_QUALITY', 75);
                $jpgBytes = $image->toJpeg($jpgQuality);
                $jpgName = pathinfo($finalFileName, PATHINFO_FILENAME) . '.jpg';
    
                $sizes = [
                    'original' => strlen($content),
                    'webp' => strlen($webpBytes),
                    'jpg' => strlen($jpgBytes),
                ];
                asort($sizes);
    
                $smallest = array_key_first($sizes);
                if ($smallest === 'webp') {
                    $chosenBytes = $webpBytes;
                    $chosenName = $webpName;
                    $mime = 'image/webp';
                } elseif ($smallest === 'jpg') {
                    $chosenBytes = $jpgBytes;
                    $chosenName = $jpgName;
                    $mime = 'image/jpeg';
                } else {
                    $chosenBytes = $content;
                    $chosenName = $finalFileName;
                }

            }
    
            $objectKey = $directoryPrefix . $chosenName;
            $disk->put($objectKey, $chosenBytes, array_merge($visibilityOptions, [
                'mimetype' => $mime,
                'ContentType' => $mime
            ]));
    
            $publicBaseUrl = rtrim((string) (config('filesystems.disks.r2.url') ?? env('R2_PUBLIC_URL', '')), '/');
            $url = $publicBaseUrl . '/' . ltrim($objectKey, '/');
    
            return [
                'success' => true,
                'url' => $url,
                'path' => $objectKey,
                'filename' => $chosenName,
                'message' => null,
            ];
    
        } catch (\Throwable $e) {
            Log::error('[R2] uploadToR2: exception', [
                'error' => $e->getMessage(),
                'type' => get_class($e),
            ]);
            return [
                'success' => false,
                'url' => null,
                'path' => null,
                'filename' => null,
                'message' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Delete a file from Cloudflare R2 by object key or full public URL.
     */
    public static function deleteFromR2(string $pathOrUrl): array
    {
        try {
            $disk = Storage::disk('r2');
            $publicBaseUrl = rtrim((string) (config('filesystems.disks.r2.url') ?? env('R2_PUBLIC_URL', '')), '/');
            $key = $pathOrUrl;
            if (str_starts_with($pathOrUrl, 'http://') || str_starts_with($pathOrUrl, 'https://')) {
                if ($publicBaseUrl !== '' && str_starts_with($pathOrUrl, $publicBaseUrl)) {
                    $key = ltrim(substr($pathOrUrl, strlen($publicBaseUrl)), '/');
                } else {
                    // Fallback: try to parse after domain
                    $parsed = parse_url($pathOrUrl);
                    $key = ltrim((string) ($parsed['path'] ?? ''), '/');
                }
            }
            $deleted = $disk->delete($key);
            return [
                'success' => (bool) $deleted,
                'path' => $key,
                'message' => null,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'path' => null,
                'message' => $e->getMessage(),
            ];
        }
    }
    
}

