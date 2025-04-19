<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Response;

class Security {
	use Singleton;

	private $secret = 'your-secret-key';

	protected function __construct() {
		$this->setup_hooks();
	}

	protected function setup_hooks() {
		add_filter('partnership/security/verify/permission', [$this, 'default_permission'], 10, 2);
		// return apply_filters('partnership/security/verify/permission', false);
		add_action('rest_api_init', [$this, 'rest_api_init']);
	}

	public function rest_api_init() {
		register_rest_route('partnership/v1', '/token', [
			'methods' => 'POST',
			'callback' => [$this, 'issue_token'],
			'permission_callback' => '__return_true'
		]);

		register_rest_route('partnership/v1', '/validate', [
			'methods' => 'POST',
			'callback' => [$this, 'validate_token'],
			'permission_callback' => '__return_true'
		]);
	}

	public function issue_token(WP_REST_Request $request) {
		$email = $request->get_param('email');
		$username = $request->get_param('username');
		$password = $request->get_param('password');
		$isSignUp = $request->get_param('isSignUp');

		$firstName = $request->get_param('firstName');
		$lastName = $request->get_param('lastName');
		$password2 = $request->get_param('password2');

		if ($isSignUp && !empty($isSignUp)) {
			if (!empty($password) && $password == $password2) {
				if (empty(trim($username))) {
					$username = strstr($email, '@', true);
					$username = sanitize_user($username, true);
					if (empty($username)) {$username = 'user_' . wp_generate_password(8, false);}
				}
				$created = wp_create_user( $username, $password, $email );
				if ($created && !is_wp_error($created)) {
					$user_id = $created;
					update_user_meta($user_id, 'first_name', $firstName);
					update_user_meta($user_id, 'last_name', $lastName);
				} else {
					return new WP_REST_Response(['message' => 'Failed to create account!', 'error' => $created->get_error_message()], 403);
				}
			}
		}

		$user = wp_authenticate($username, $password);
		if (is_wp_error($user)) {
			return new WP_REST_Response(['message' => 'Invalid credentials'], 403);
		}

		$payload = [
			'user_id' => $user->ID,
			'iat' => time(),
			'exp' => time() + 3600
		];

		$token = $this->encode_token($payload);
		return ['token' => $token];
	}

	public function validate_token(WP_REST_Request $request) {
		$token = $this->get_token_from_header();
		if (!$token) return new WP_REST_Response(['valid' => false], 403);

		$data = $this->decode_token($token);
		if (!$data) return new WP_REST_Response(['valid' => false], 403);

		return ['valid' => true, 'user_id' => $data['user_id']];
	}

	public function permission_callback() {
		return true;
		$data = $this->decode_token($this->get_token_from_header());
		return $data !== false;
	}

	private function encode_token(array $payload): string {
		$header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
		$body = base64_encode(json_encode($payload));
		$signature = hash_hmac('sha256', "$header.$body", $this->secret, true);
		$signature_encoded = base64_encode($signature);
		return "$header.$body.$signature_encoded";
	}

	private function decode_token($token) {
		if (! is_string($token)) {return false;}
		$parts = explode('.', $token);
		if (count($parts) !== 3) {return false;}

		[$header_b64, $body_b64, $sig_b64] = $parts;

		$expected_sig = base64_encode(hash_hmac('sha256', "$header_b64.$body_b64", $this->secret, true));
		if (!hash_equals($expected_sig, $sig_b64)) {return false;}

		$payload = json_decode(base64_decode($body_b64), true);
		if (!$payload || time() > $payload['exp']) {return false;}

		return $payload;
	}

	private function get_token_from_header(): ?string {
		$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
		if (stripos($auth, 'Bearer ') === 0) {
			return trim(substr($auth, 7));
		}
		return null;
	}
}
