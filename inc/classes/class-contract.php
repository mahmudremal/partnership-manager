<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Contract {
    use Singleton;

    protected function __construct() {
        $this->setup_hooks();
        global $wpdb;
    }

    protected function setup_hooks() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

	public function register_routes() {
		register_rest_route('partnership/v1', '/contracts/packages', [
			'methods' => 'GET',
			'callback' => [$this, 'get_contracts_packages']
		]);
	}

    public function get_contracts_packages(WP_REST_Request $request) {
        $response = [];
        // 
        // 
        return rest_ensure_response($response);
    }
}
