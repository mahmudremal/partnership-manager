<?php
/**
 * Translation management class
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Translations {
	use Singleton;

    private $directory;

	protected function __construct() {
        $this->directory = untrailingslashit(WP_PARTNERSHIPM_DIR_PATH . '/languages/translations');
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'rest_api_init']);
	}
    public function rest_api_init() {
        register_rest_route('partnership/v1', '/languages', [
			'methods' => 'GET',
			'callback' => [$this, 'get_languages'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
        register_rest_route('partnership/v1', '/translations', [
			'methods' => 'GET',
			'callback' => [$this, 'get_translations'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/translations', [
			'methods' => 'POST',
			'callback' => [$this, 'post_translation'],
			'permission_callback' => [Security::get_instance(), 'permission_callback'],
            'args'                => [
                'language' => [
                    'required'    => true,
                    'type'        => 'string',
                    'description' => __('The language code for the translation.', 'wp-partnershipm'),
                ],
                'list'    => [
                    'required'    => true,
                    'type'        => ['array', 'object'],
                    'description' => __('An list object of languages as per key: value structure.', 'wp-partnershipm'),
                ]
            ]
		]);
		register_rest_route('partnership/v1', '/locale', [
			'methods' => 'POST',
			'callback' => [$this, 'set_user_locale'],
			'permission_callback' => [Security::get_instance(), 'permission_callback'],
            'args'                => [
                'language' => [
                    'required'    => true,
                    'type'        => 'string',
                    'description' => __('The language code for the translation.', 'wp-partnershipm'),
                ],
                'user_id'    => [
                    'required'    => true,
                    'type'        => 'integer',
                    'description' => __('User id to set that language as default language.', 'wp-partnershipm'),
                ]
            ]
		]);
    }
    public function language_path($language) {
        return $this->directory . '/' . $language . '.json';
    }
    public function get_languages(WP_REST_Request $request) {
        $languages = [];
        if (is_dir($this->directory)) {
            $files = glob($this->directory . '/*.json');
            foreach ($files as $file) {
                $languages[] = basename($file, '.json');
            }
        }
        return rest_ensure_response($languages);
    }
	public function get_translations(WP_REST_Request $request) {
		$language = $request->get_param('language');$data = [];
        if (file_exists($this->language_path($language)) && !is_dir($this->language_path($language))) {
            $data = (array) json_decode(file_get_contents($this->language_path($language)), true);
        }
		return rest_ensure_response($data);
	}
	public function post_translation(WP_REST_Request $request) {
		$language = $request->get_param('language');
		$list = $request->get_param('list');
        
        if (file_exists($this->language_path($language)) && !is_dir($this->language_path($language))) {
            $data = (array) json_decode(file_get_contents($this->language_path($language)), true);
            foreach ($list as $key => $value) {$data[$key] = $value;}
            file_put_contents($this->language_path($language), json_encode($data));
            return ['success' => true];
        }
		
		return ['success' => false];
	}
	public function set_user_locale(WP_REST_Request $request) {
		$language = $request->get_param('language');
		$user_id = (int) $request->get_param('user_id');

        if ($language && !empty($language) && $user_id && !empty($user_id)) {
            $updated = update_user_meta($user_id, 'partnership_dashboard_locale', $language);
            return ['success' => $updated];
        }
		
		return ['success' => false];
	}

}