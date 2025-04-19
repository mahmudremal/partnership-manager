<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Request;
use WP_User;

class Finance {
	use Singleton;

	protected $table;

	protected function __construct() {
		global $wpdb;
		$this->table = $wpdb->prefix . 'partnership_finance';
		$this->setup_hooks();
	}

	protected function setup_hooks() {
		register_activation_hook(WP_PARTNERSHIPM__FILE__, [$this, 'register_activation_hook']);
		register_deactivation_hook(WP_PARTNERSHIPM__FILE__, [$this, 'register_deactivation_hook']);
		add_action('rest_api_init', [$this, 'register_routes']);
	}

	public function register_activation_hook() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		$sql = "CREATE TABLE {$this->table} (
			id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id BIGINT(20) UNSIGNED NOT NULL,
			amount DECIMAL(10,2) NOT NULL,
			type ENUM('credit', 'debit') NOT NULL,
			reference VARCHAR(255),
			description TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id)
		) $charset_collate;";
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta($sql);
	}

	public function register_deactivation_hook() {
		// optionally drop table on deactivation
	}

	public function register_routes() {
		register_rest_route('partnership/v1', '/finance/transactions', [
			'methods' => 'GET',
			'callback' => [$this, 'get_transactions'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/finance/transaction', [
			'methods' => 'POST',
			'callback' => [$this, 'add_transaction'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/finance/balance/(?P<user_id>\d+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_balance'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
	}

	public function add_transaction(WP_REST_Request $request) {
		global $wpdb;
		$user_id = absint($request->get_param('user_id'));
		$amount = floatval($request->get_param('amount'));
		$type = $request->get_param('type');
		$reference = sanitize_text_field($request->get_param('reference'));
		$description = sanitize_textarea_field($request->get_param('description'));

		if (!in_array($type, ['credit', 'debit'])) {
			return new \WP_Error('invalid_type', 'Invalid transaction type', ['status' => 400]);
		}
		if ($amount <= 0) {
			return new \WP_Error('invalid_amount', 'Amount must be positive', ['status' => 400]);
		}

		$adjusted_amount = $type === 'debit' ? -$amount : $amount;
		$previous_balance = floatval(get_user_meta($user_id, '_finance_balance', true));
		$new_balance = $previous_balance + $adjusted_amount;
		update_user_meta($user_id, '_finance_balance', $new_balance);

		$wpdb->insert($this->table, [
			'user_id' => $user_id,
			'amount' => $amount,
			'type' => $type,
			'reference' => $reference,
			'description' => $description,
			'created_at' => current_time('mysql'),
		]);

		return ['status' => 'success', 'new_balance' => $new_balance];
	}

	public function get_transactions(WP_REST_Request $request) {
		global $wpdb;
		$user_id = absint($request->get_param('user_id'));
		$limit = absint($request->get_param('limit')) ?: 20;

		$results = $wpdb->get_results(
			$wpdb->prepare("SELECT * FROM {$this->table} WHERE user_id = %d ORDER BY created_at DESC LIMIT %d", $user_id, $limit),
			ARRAY_A
		);

		return rest_ensure_response($results);
	}

	public function get_balance(WP_REST_Request $request) {
		$user_id = absint($request->get_param('user_id'));
		$balance = get_user_meta($user_id, '_finance_balance', true);
		return ['user_id' => $user_id, 'balance' => floatval($balance)];
	}
}
