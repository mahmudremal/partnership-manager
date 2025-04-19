<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Request;
use WP_User;

class Referral {
	use Singleton;

	protected function __construct() {
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'rest_api_init']);
		add_action('init', [$this, 'register_referral_post_type']);
        add_action('template_redirect', [$this, 'maybe_set_referral_cookie']);
		add_action('user_register', [$this, 'track_referral_on_register'], 10, 1);
		add_action('woocommerce_order_status_completed', [$this, 'track_referral_on_order'], 10, 1);
		add_action('create_referral_record', [$this, 'create_referral_record'], 10, 2);
	}
	public function register_referral_post_type() {
		register_post_type('referral', [
			'label' => 'Referrals',
			'public' => false,
			'show_ui' => false,
			'supports' => ['title', 'custom-fields'],
		]);
	}
	public function rest_api_init() {
		register_rest_route('partnership/v1', '/referral-link/(?P<user_id>\d+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_referral_link'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		
		register_rest_route('partnership/v1', '/referral-code/check', [
			'methods' => 'POST',
			'callback' => [$this, 'check_referral_code'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		
		register_rest_route('partnership/v1', '/referral-code/save', [
			'methods' => 'POST',
			'callback' => [$this, 'save_referral_code'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		
		register_rest_route('partnership/v1', '/referrals', [
			'methods' => 'GET',
			'callback' => [$this, 'get_referrals'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/referrals', [
			'methods' => 'POST',
			'callback' => [$this, 'create_referral'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/referrals/(?P<id>\d+)', [
			'methods' => 'PUT',
			'callback' => [$this, 'update_referral'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/referrals/(?P<id>\d+)', [
			'methods' => 'DELETE',
			'callback' => [$this, 'delete_referral'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/referrals/invite', [
			'methods' => 'POST',
			'callback' => [$this, 'invite_user'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
	}
	
	public function get_referral_link($user_id) {
		$code = get_user_meta($user_id, 'referral_code', true);
		if (!$code) {
			$code = substr(md5(uniqid()), 0, 4);
			update_user_meta($user_id, 'referral_code', $code);
		}
		return ['link' => add_query_arg('ref', $code, site_url())];
	}
	
	public function check_referral_code($code) {
		$users = get_users([
			'meta_key' => 'referral_code',
			'meta_value' => $code,
			'number' => 1,
			'fields' => 'ID',
		]);
		return ['exists' => !empty($users)];
	}
	
	public function save_referral_code($user_id, $code) {
		$existing = get_user_meta($user_id, 'referral_code', true);
		if ($existing) {
			return new \WP_Error('referral_code_exists', 'Referral code already settled for this user.');
		}
		if ($this->referral_code_exists($code)) {
			return new \WP_Error('referral_code_taken', 'Referral code is already in use by another user.');
		}
		update_user_meta($user_id, 'referral_code', $code);
		return ['saved' => true];
	}
	
    public function maybe_set_referral_cookie() {
        if (isset($_GET['ref']) && is_numeric($_GET['ref'])) {
            setcookie('ref', absint($_GET['ref']), time() + (30 * DAY_IN_SECONDS), COOKIEPATH, COOKIE_DOMAIN);
            $_COOKIE['ref'] = absint($_GET['ref']);
			wp_redirect(home_url('/dashboard/'));die;
        }
    }
	public function get_referrals(WP_REST_Request $request) {
		$author = $request->get_param('author');
		$args = [
			'post_type' => 'referral',
			'post_status' => 'publish',
			'meta_key' => 'referrer_id',
			'meta_value' => $author,
		];
		$query = new \WP_Query($args);
		$data = [];
		foreach ($query->posts as $post) {
			$data[] = [
				'id' => $post->ID,
				'title' => $post->post_title,
				'referrer_id' => get_post_meta($post->ID, 'referrer_id', true),
				'user_id' => get_post_meta($post->ID, 'user_id', true),
				'converted' => get_post_meta($post->ID, 'converted', true),
			];
		}
		return rest_ensure_response($data);
	}
	public function create_referral(WP_REST_Request $request) {
		$referrer_id = $request->get_param('referrer_id');
		$user_id = $request->get_param('user_id');
		$post_id = wp_insert_post([
			'post_type' => 'referral',
			'post_title' => 'Referral by ' . $referrer_id,
			'post_status' => 'publish',
		]);
		update_post_meta($post_id, 'referrer_id', $referrer_id);
		update_post_meta($post_id, 'user_id', $user_id);
		update_post_meta($post_id, 'converted', false);
		return ['id' => $post_id];
	}
	public function update_referral(WP_REST_Request $request) {
		$id = $request->get_param('id');
		$converted = $request->get_param('converted');
		update_post_meta($id, 'converted', $converted);
		return ['updated' => true];
	}
	public function delete_referral(WP_REST_Request $request) {
		$id = $request->get_param('id');
		wp_delete_post($id, true);
		return ['deleted' => true];
	}
	public function invite_user(WP_REST_Request $request) {
		$email = $request->get_param('email');
		$referrer_id = $request->get_param('referrer_id');
		$link = add_query_arg('ref', $referrer_id, site_url());
		// send email to $email with $link
		return ['status' => 'sent', 'link' => $link];
	}
	public function track_referral_on_register($user_id) {
		if (!isset($_COOKIE['ref'])) return;
		$referrer_id = absint($_COOKIE['ref']);
		$post_id = wp_insert_post([
			'post_type' => 'referral',
			'post_title' => 'Referral register ' . $user_id,
			'post_status' => 'publish',
		]);
		update_post_meta($post_id, 'referrer_id', $referrer_id);
		update_post_meta($post_id, 'user_id', $user_id);
		update_post_meta($post_id, 'converted', false);
	}
	public function track_referral_on_order($order_id) {
		$order = wc_get_order($order_id);
		$user_id = $order->get_user_id();
		$query = new \WP_Query([
			'post_type' => 'referral',
			'meta_query' => [
				[
					'key' => 'user_id',
					'value' => $user_id,
				]
			]
		]);
		foreach ($query->posts as $post) {
			update_post_meta($post->ID, 'converted', true);
			// calculate and store amount here
		}
	}

	public function create_referral_record($referrer_id, $user_id) {
        $post_id = wp_insert_post([
            'post_title' => 'Referral by ' . $referrer_id . ' of ' . $user_id,
            'post_status' => 'publish',
            'post_type' => 'referral',
        ]);

        if ($post_id) {
            update_post_meta($post_id, 'referrer_id', $referrer_id);
            update_post_meta($post_id, 'user_id', $user_id);
            update_post_meta($post_id, 'converted', false);
            return $post_id;
        }
        return false;
    }
	
}
