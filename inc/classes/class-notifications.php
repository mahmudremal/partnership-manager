<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Request;

class Notifications {
	use Singleton;

	protected $table;

	protected function __construct() {
		global $wpdb;
		$this->table = $wpdb->prefix . 'partnership_notifications';
		$this->setup_hooks();
		$this->setup_eventlisters();
	}

	protected function setup_hooks() {
		register_activation_hook(WP_PARTNERSHIPM__FILE__, [$this, 'register_activation_hook']);
		register_deactivation_hook(WP_PARTNERSHIPM__FILE__, [$this, 'register_deactivation_hook']);
		add_action('rest_api_init', [$this, 'register_routes']);
	}
	
	public function setup_eventlisters() {
		add_action('partnersmanagerpayment/subscription_created', function($subscription, $args, $provider, $post_id) {
			$this->add_notification([
				'image' => null,
				'url' => $subscription,
				'type' => 'subscription_created',
				'user_id' => get_current_user_id(),
				'title' => __('Subscription Created', 'wp-partnershipm'),
				'subtitle' => sprintf(__('A new subscription was created using %s.', 'wp-partnershipm'), $provider),
			]);
		}, 10, 4);
		
		add_action('partnersmanagerpayment/subscription_paused', function($paused, $subscription_id, $provider) {
			if (!$paused) return;
			$this->add_notification([
				'image' => null,
				'url' => $subscription_id,
				'type' => 'subscription_paused',
				'user_id' => get_current_user_id(),
				'title' => __('Subscription Paused', 'wp-partnershipm'),
				'subtitle' => sprintf(__('Your subscription via %s was paused.', 'wp-partnershipm'), $provider),
			]);
		}, 10, 3);
		
		add_action('partnersmanagerpayment/subscription_resumed', function($resumed, $subscription_id, $provider) {
			if (!$resumed) return;
			$this->add_notification([
				'image' => null,
				'url' => $subscription_id,
				'type' => 'subscription_resumed',
				'user_id' => get_current_user_id(),
				'title' => __('Subscription Resumed', 'wp-partnershipm'),
				'subtitle' => sprintf(__('Your subscription via %s was resumed.', 'wp-partnershipm'), $provider),
			]);
		}, 10, 3);
		
		add_action('partnersmanagerpayment/subscription_cancelled', function($cancelled, $subscription_id, $provider) {
			if (!$cancelled) return;
			$this->add_notification([
				'image' => null,
				'url' => $subscription_id,
				'type' => 'subscription_cancelled',
				'user_id' => get_current_user_id(),
				'title' => __('Subscription Cancelled', 'wp-partnershipm'),
				'subtitle' => sprintf(__('Your subscription via %s was cancelled.', 'wp-partnershipm'), $provider),
			]);
		}, 10, 3);
		
		add_action('partnersmanagerpayment/subscription_refunded', function($refunded, $subscription_id, $provider, $args) {
			if (!$refunded) return;
			$this->add_notification([
				'image' => null,
				'url' => $subscription_id,
				'type' => 'subscription_refunded',
				'user_id' => get_current_user_id(),
				'title' => __('Refund Issued', 'wp-partnershipm'),
				'subtitle' => sprintf(__('A refund was issued for your subscription via %s.', 'wp-partnershipm'), $provider),
			]);
		}, 10, 4);
		
	}

	public function register_activation_hook() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		$sql = "CREATE TABLE {$this->table} (
			id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id BIGINT(20) UNSIGNED NOT NULL,
			title VARCHAR(255) NOT NULL,
			subtitle TEXT,
			url TEXT NULL,
			image TEXT NULL,
			type VARCHAR(100) NOT NULL,
			seen BOOLEAN DEFAULT FALSE,
			created DATETIME DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id)
		) $charset_collate;";
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta($sql);
	}

	public function register_deactivation_hook() {
		// Optional: Clean up or archive logic
	}

	public function register_routes() {
		register_rest_route('partnership/v1', '/notifications/(?P<user_id>\d+)/(?P<page>\d+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_notifications']
		]);
	}

	public function get_notifications(WP_REST_Request $request) {
		global $wpdb;

		$user_id = intval($request['user_id']);
		$page = max(1, intval($request['page']));
		$per_page = 10;
		$offset = ($page - 1) * $per_page;

		$total_items = $wpdb->get_var($wpdb->prepare(
			"SELECT COUNT(*) FROM {$this->table} WHERE user_id = %d",
			$user_id
		));

		$total_pages = ceil($total_items / $per_page);

		$results = $wpdb->get_results($wpdb->prepare(
			"SELECT * FROM {$this->table} WHERE user_id = %d ORDER BY created DESC LIMIT %d OFFSET %d",
			$user_id, $per_page, $offset
		), ARRAY_A);

		$response = [
			'list' => $results,
			'pagination' => [
				'totalItems' => (int)$total_items,
				'totalPages' => (int)$total_pages,
				'currentPage' => (int)$page,
				'nextPage' => $page < $total_pages ? $page + 1 : null,
				'prevPage' => $page > 1 ? $page - 1 : null,
			]
		];

		return rest_ensure_response($response);
	}

	public function add_notification($args = []) {
		global $wpdb;
		$args = wp_parse_args($args, [
			'user_id' => 0,
			'title' => '',
			'subtitle' => '',
			'url' => null,
			'image' => null,
			'type' => 'general',
			'seen' => false,
			'created' => current_time('mysql'),
		]);

		$wpdb->insert($this->table, $args);
		return $wpdb->insert_id;
	}

	public function cleanup_notifications($user_id) {
		global $wpdb;
		return $wpdb->delete($this->table, ['user_id' => $user_id]);
	}

	public function update_notification($id, $data = []) {
		global $wpdb;
		return $wpdb->update($this->table, $data, ['id' => $id]);
	}

	public function mark_seen($id, $seen = true) {
		return $this->update_notification($id, ['seen' => (bool)$seen]);
	}

	public function delete_notification($id) {
		global $wpdb;
		return $wpdb->delete($this->table, ['id' => $id]);
	}
}
