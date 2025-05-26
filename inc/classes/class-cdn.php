<?php
/**
 * CDN media library
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use CURLFile;

class Cdn {
	use Singleton;

    private $host;
    private $pub_key;
    private $api_key;
    // private $sizes2_generate = [];
    
    protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}

	protected function setup_hooks() {
        // add_action('wp_head', [$this, 'wp_head']);
        // add_action('send_headers', [$this, 'send_headers']);
        add_action('add_attachment', [$this, 'handle_upload']);
        add_action('delete_attachment', [$this, 'handle_deletion']);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        add_filter('wp_get_attachment_url', [$this, 'wp_get_attachment_url'], 10, 2);
        add_filter('wp_get_attachment_image_src', [$this, 'wp_get_attachment_image_src'], 10, 3);
        add_filter('wp_update_attachment_metadata', [$this, 'wp_update_attachment_metadata'], 10, 2);
        add_filter('intermediate_image_sizes_advanced', [$this, 'intermediate_image_sizes_advanced'], 10, 3);
        
    }

    public function get_cdn_host() {
        if (! $this->host) {
            $this->host = apply_filters('pm_project/system/getoption', 'cdn-provider', 'media');
        }
        return $this->host;
    }
    public function get_api_key() {
        if (! $this->api_key) {
            $this->api_key = apply_filters('pm_project/system/getoption', 'cdn-apikey', false);
        }
        return $this->api_key;
    }
    public function get_pub_key() {
        if (! $this->pub_key) {
            $this->pub_key = apply_filters('pm_project/system/getoption', 'cdn-pubkey', false);
        }
        return $this->pub_key;
    }

    public function wp_head() {
        if (headers_sent()) {return;}
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return;}
        if ($this->get_cdn_host() === 'media') {return;}
        // 
        echo '<meta http-equiv="Content-Security-Policy" content="img-src \'self\' https://ik.imagekit.io https://res.cloudinary.com;">' . "\n";
    }
    public function send_headers() {
        if (headers_sent()) {return;}
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return;}
        if ($this->get_cdn_host() === 'media') {return;}
        // 
        $img_sources = ["'self'", 'https://secure.gravatar.com', 'data:', 'https://ik.imagekit.io', 'https://res.cloudinary.com'];
        $script_sources = ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'];
        $style_sources = ["'self'", "'unsafe-inline'", '*'];
        $font_sources = ["'self'", 'data:', '*'];
        $worker_sources = ["'self'", 'blob:'];
        $connect_sources = ["'self'", '*'];
        $frame_sources = ['*'];
        $csp = [];
        $csp[] = "default-src 'self'";
        $csp[] = 'script-src ' . implode(' ', array_unique($script_sources));
        $csp[] = 'style-src ' . implode(' ', array_unique($style_sources));
        $csp[] = 'font-src ' . implode(' ', array_unique($font_sources));
        $csp[] = 'img-src ' . implode(' ', array_unique($img_sources));
        $csp[] = 'connect-src ' . implode(' ', array_unique($connect_sources));
        $csp[] = 'frame-src ' . implode(' ', array_unique($frame_sources));
        $csp[] = 'worker-src ' . implode(' ', array_unique($worker_sources));
        // 
        header('Content-Security-Policy: ' . implode('; ', $csp));
    }

    public function settings($args) {
		$args['cdn']		= [
			'title'							=> __('CDN', 'wp-partnershipm'),
			'description'					=> __('CDN configurations, fields customization. Things enables and disables.', 'wp-partnershipm'),
			'fields'						=> [
				[
					'id' 					=> 'cdn-paused',
					'label'					=> __('Pause', 'wp-partnershipm'),
					'description'			=> __('Mark to pause the cdn unconditionally. Would be a reason for site image break.', 'wp-partnershipm'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'cdn-provider',
					'label'					=> __('CDN Provider', 'wp-partnershipm'),
					'description'			=> __('Select a cdn provider for image syncing from wordpress media library to cdn host.', 'wp-partnershipm'),
					'type'					=> 'select',
					'options'				=> [
						'media'				=> __('WP Media library', 'partnership-manager'),
						'cloudinary'		=> __('Cloudinary', 'partnership-manager'),
						'imagekit'			=> __('imagekit', 'partnership-manager'),
					],
					'default'				=> 'media'
				],
				[
					'id' 					=> 'cdn-pubkey',
					'label'					=> __('Public Key', 'wp-partnershipm'),
					'description'			=> __('CDN api public key.', 'wp-partnershipm'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 					=> 'cdn-apikey',
					'label'					=> __('API Key', 'wp-partnershipm'),
					'description'			=> __('CDN api secret key.', 'wp-partnershipm'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 					=> 'cdn-delocals',
					'label'					=> __('Delete File', 'wp-partnershipm'),
					'description'			=> __('Delete files instantly after sending to cdn. This will also delete all resized images from .', 'wp-partnershipm'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
			]
		];
        return $args;
    }

    public function handle_upload($post_ID) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return;}
        if ($this->get_cdn_host() === 'media') {return;}

        $file_path = get_attached_file($post_ID);
        $file_type = wp_check_filetype($file_path);

        if ($this->get_cdn_host() === 'cloudinary') {
            $upload_url = 'https://api.cloudinary.com/v1_1/' . $this->get_api_key() . '/image/upload';
            $response = wp_remote_post($upload_url, [
                'body' => [
                    'file' => curl_file_create($file_path, $file_type['type']),
                    'upload_preset' => 'unsigned'
                ]
            ]);
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (!empty($body['secure_url'])) {
                update_post_meta($post_ID, '_hostedon', 'cloudinary');
                update_post_meta($post_ID, '_cdn_link', esc_url($body['secure_url']));
                update_post_meta($post_ID, '_cdn_id', sanitize_text_field($body['public_id']));
                $this->delete_attachment_file_with_thumbnails($file_path, $post_ID);
            }
        }

        if ($this->get_cdn_host() === 'imagekit') {
            $upload_url = 'https://upload.imagekit.io/api/v1/files/upload';
            $filename = basename($file_path);

            $curl = curl_init();

            $post_fields = [
                'file' => new CURLFile($file_path, $file_type['type'], $filename),
                'fileName' => $filename,
                'useUniqueFileName' => 'true',
                'publicKey' => $this->get_pub_key(),
                // Add other optional fields if needed
            ];

            curl_setopt_array($curl, [
                CURLOPT_URL => $upload_url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 20,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $post_fields,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Basic ' . base64_encode($this->get_api_key() . ':'),
                ],
            ]);

            $response = curl_exec($curl);
            $curl_error = curl_error($curl);
            $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);

            if ($response === false) {
                wp_die("ImageKit Upload Error: $curl_error (HTTP Status: $http_status)");
            }

            $body = json_decode($response, true);
            // print_r($body);wp_die();

            if (!empty($body['url'])) {
                update_post_meta($post_ID, '_hostedon', 'imagekit');
                update_post_meta($post_ID, '_cdn_link', esc_url($body['url']));
                update_post_meta($post_ID, '_cdn_path', parse_url($body['url'])['path']);
                update_post_meta($post_ID, '_cdn_id', sanitize_text_field($body['fileId']));
                $this->delete_attachment_file_with_thumbnails($file_path, $post_ID);
            } else {
                wp_die("ImageKit Response Error: " . print_r($body, true));
            }
        }


    }

    public function wp_get_attachment_url($url, $post_ID) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return $url;}
        $cdn_url = get_post_meta($post_ID, '_cdn_link', true);
        return $cdn_url ? $cdn_url : $url;
    }

    public function handle_deletion($post_ID) {
        $hosted_on = get_post_meta($post_ID, '_hostedon', true);
        $cdn_id = get_post_meta($post_ID, '_cdn_id', true);

        if (!$hosted_on || !$cdn_id) return;

        if ($hosted_on === 'cloudinary') {
            $delete_url = 'https://api.cloudinary.com/v1_1/' . $this->get_api_key() . '/resources/image/upload';
            $timestamp = time();
            $params_to_sign = "public_id={$cdn_id}&timestamp={$timestamp}";
            $signature = sha1($params_to_sign . $this->get_api_key());
            wp_remote_post($delete_url . '/' . $cdn_id, [
                'method' => 'DELETE',
                'body' => [
                    'public_id' => $cdn_id,
                    'timestamp' => $timestamp,
                    'signature' => $signature,
                    'api_key' => $this->get_api_key(),
                ]
            ]);
        }

        if ($hosted_on === 'imagekit') {
            $delete_url = 'https://api.imagekit.io/v1/files/' . $cdn_id;
            wp_remote_request($delete_url, [
                'method' => 'DELETE',
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode($this->get_api_key() . ':')
                ]
            ]);
        }
    }


    public function get_resized_url($post_ID, array $params = [], $_return_object = false) {

        $file_path = get_post_meta($post_ID, '_cdn_path', true);
        if (empty($file_path)) {return false;}

        if (empty($params['w'])) {unset($params['w']);}
        if (empty($params['h'])) {unset($params['h']);}
        
        $mime_type = $params['mime_type'] ?? '';
        if (empty($params['mime_type'])) {
            $mime_type = get_post_mime_type($post_ID);
        }
        if ($mime_type && strpos($mime_type, 'image/') !== 0) {
            return $file_path; // Return original file if not an image
        }
        if (isset($params['mime_type'])) {
            unset($params['mime_type']);
        }

        $base_url = 'https://ik.imagekit.io/';

        // Build transformation string
        $transforms = [];
        foreach ($params as $key => $value) {
            $transforms[] = $key . '-' . $value;
        }
        $transform_path = implode(",", $transforms);

        // Final URL
        $image_url = esc_url(rtrim($base_url, '/') . '/' . ltrim($file_path, '/')) . '?tr=' . $transform_path;
        // 
        return (! $_return_object) ? $image_url : [
            'url' => $image_url,
            'width' => $params['w'] ?? null,
            'height' => $params['h'] ?? null,
            'fit' => $params['fit'] ?? null,
            'crop' => $params['c'] ?? null,
            // 'path' => str_replace($base_url, '', $image_url),
            'path' => pathinfo($image_url, PATHINFO_BASENAME),
        ];
    }

    public function wp_get_attachment_image_src($image, $attachment_id, $size) {
        // if ($this->get_cdn_host() === 'media') {return $image;}
        // if ($this->get_cdn_host() !== 'imagekit') {return $image;}
        $dimensions = [];

        [$dimensions['width'], $dimensions['height']] = $size;

        $url = $this->get_resized_url($attachment_id, [
            'w' => $dimensions['width'],
            'h' => $dimensions['height'],
            'fit' => 'cover'
        ]);
        // print_r($url);wp_die();

        return $url ? [$url, $dimensions['width'], $dimensions['height'], true] : $image;
    }

    public function delete_attachment_file_with_thumbnails($file_path, $_attachment_id) {
        if (!apply_filters('pm_project/system/isactive', 'cdn-delocals')) {return;}
        
        // Get attachment metadata
        $metadata = wp_get_attachment_metadata($_attachment_id);
        if (!$metadata) {
            return false;
        }

        // Get upload directory base path
        $upload_dir = wp_upload_dir();
        $base_path = trailingslashit($upload_dir['basedir']);

        // Delete main file if it exists
        if (file_exists($file_path)) {
            @unlink($file_path);
        }

        // Check and delete thumbnails
        if (isset($metadata['sizes']) && is_array($metadata['sizes'])) {
            $attachment_file = get_attached_file($_attachment_id);
            $attachment_dir = trailingslashit(dirname($attachment_file));

            foreach ($metadata['sizes'] as $size) {
                if (isset($size['file'])) {
                    $thumb_path = $attachment_dir . $size['file'];
                    if (file_exists($thumb_path)) {
                        @unlink($thumb_path);
                    }
                }
            }
        }

        return true;
    }

    public function wp_update_attachment_metadata($metadata, $attachment_id) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return $metadata;}
        if ($this->get_cdn_host() === 'media') {return $metadata;}
        $sizes = wp_get_registered_image_subsizes();
        if (empty($sizes)) {return $metadata;}
        // 
        foreach ($sizes as $size => $size_data) {
            $_resized = $this->get_resized_url($attachment_id, [
                'w' => $size_data['width'],
                'h' => $size_data['height'],
                'fit' => 'cover',
                // 'c' => $size_data['crop'] ? 'crop' : 'scale',
                // 'q' => $size_data['quality'] ?? 80,
                'mime_type' => $size_data['mime_type'] ?? $metadata['mime_type'] ?? 'image/jpeg',
            ], true);
            $metadata['sizes'][$size] = [
                ...wp_parse_args((array) $size_data, [
                    // 'file' => $metadata['sizes'][$size]['file'] ?? $metadata['file'] ?? '',
                    'file' => $_resized['path'],
                    'width' => $_resized['width'],
                    'height' => $_resized['height'],
                    'mime_type' => $_resized['mime_type'] ?? $metadata['mime_type'] ?? '',
                    // 'filesize' => 0,
                    'crop' => false,
                    'quality' => 80
                ]),
                'url' => $_resized['url']
            ];
        }
        return $metadata;
    }

    public function intermediate_image_sizes_advanced($sizes, $attachment_id, $metadata) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return $sizes;}
        if ($this->get_cdn_host() === 'media') {return $sizes;}
        // $this->sizes2_generate = $sizes;
        return [];
    }
    
}
