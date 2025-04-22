<?php
/**
 * Enqueue theme assets
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;

class Assets {
	use Singleton;

	/**
	 * Constructor for the Assets class.
	 * Sets up hooks.
	 */
	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}

	/**
	 * Sets up WordPress hooks for enqueuing assets.
	 */
	protected function setup_hooks() {
		add_action('wp_enqueue_scripts', [ $this, 'register_styles' ]);
		add_action('wp_enqueue_scripts', [ $this, 'register_scripts' ]);
		add_action('admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ], 10, 1);
		add_filter('partnershipmang/siteconfig', [ $this, 'siteConfig' ], 1, 1);
	}

	/**
	 * Registers and enqueues frontend styles.
	 */
	public function register_styles() {
		if (!apply_filters('partnership_manager_screen_active', false)) {return;}

		// Enqueue styles.
		$version = $this->filemtime(WP_PARTNERSHIPM_BUILD_CSS_DIR_PATH . '/public.css');
		wp_enqueue_style('wp-partnershipm-public', WP_PARTNERSHIPM_BUILD_CSS_URI . '/public.css', [], $version, 'all');
		wp_enqueue_style('wp-partnershipm-admin', WP_PARTNERSHIPM_BUILD_CSS_URI . '/admin.css', [], $this->filemtime(WP_PARTNERSHIPM_BUILD_CSS_DIR_PATH . '/admin.css'), 'all');
	}

	/**
	 * Registers and enqueues frontend scripts.
	 */
	public function register_scripts() {
		if (!apply_filters('partnership_manager_screen_active', false)) {return;}

		// Enqueue scripts.
		wp_register_script('wp-partnershipm-public', WP_PARTNERSHIPM_BUILD_JS_URI . '/public.js', [ 'wp-partnershipm-admin' ], $this->filemtime(WP_PARTNERSHIPM_BUILD_JS_DIR_PATH . '/public.js'), true);
		$this->admin_enqueue_scripts(false);
	}

	/**
	 * Registers and enqueues admin styles and scripts.
	 *
	 * @param string $curr_page The current admin page.
	 */
	public function admin_enqueue_scripts($curr_page) {
		wp_register_style('wp-partnershipm-tailwind', WP_PARTNERSHIPM_DIR_URI . '/assets/tailwind.css', [], $this->filemtime(WP_PARTNERSHIPM_DIR_PATH . '/assets/tailwind.css'), 'all');
		wp_register_style('wp-partnershipm-admin', WP_PARTNERSHIPM_BUILD_CSS_URI . '/admin.css', [], $this->filemtime(WP_PARTNERSHIPM_BUILD_CSS_DIR_PATH . '/admin.css'), 'all');
		wp_register_script('wp-partnershipm-admin', WP_PARTNERSHIPM_BUILD_JS_URI . '/admin.js', [ 'wp-partnershipm-runtime' ], $this->filemtime(WP_PARTNERSHIPM_BUILD_JS_DIR_PATH . '/admin.js'), true);
		wp_register_script('wp-partnershipm-runtime', WP_PARTNERSHIPM_BUILD_JS_URI . '/runtime.js', [], $this->filemtime(WP_PARTNERSHIPM_BUILD_JS_DIR_PATH . '/runtime.js'), true);
		
		wp_localize_script('wp-partnershipm-admin', 'partnershipmangConfig', apply_filters('partnershipmang/siteconfig', []));
		if ($curr_page !== 'toplevel_page_pro-tools') {return;}
		wp_enqueue_style('wp-partnershipm-tailwind');
		wp_enqueue_style('wp-partnershipm-admin');
		wp_enqueue_script('wp-partnershipm-admin');
	}

	/**
	 * Gets the file modification time.
	 *
	 * @param string $path The file path.
	 * @return int|false The file modification time or false if the file does not exist.
	 */
	public static function filemtime($path) {
		return (file_exists($path)&&!is_dir($path))?filemtime($path):false;
	}

	/**
	 * Configures site settings for localization.
	 *
	 * @param array $args The configuration arguments.
	 * @return array The modified configuration arguments.
	 */
	public function siteConfig($args) {
		return wp_parse_args([
			'ajaxUrl'    		=> admin_url('admin-ajax.php'),
			'ajax_nonce' 		=> wp_create_nonce('ajax/verify/nonce'),
			'logout_url'		=> wp_logout_url(),
			'loggedin'			=> is_user_logged_in(),
			'buildPath'  		=> WP_PARTNERSHIPM_BUILD_URI,
			'i18n'				=> [
				'pls_wait'		=> __('Please wait...', 'wp-partnershipm'),
			],
			'locale'			=> get_user_meta(get_current_user_id(), 'partnership_dashboard_locale', true), // get_user_locale(),
			'user_id'			=> get_current_user_id(),
			'isSignUp'			=> strpos($_SERVER['REQUEST_URI'], 'signup') !== false
		], (array) $args);
	}

	/**
	 * Placeholder function for dequeuing scripts.
	 */
	public function wp_denqueue_scripts() {}
}
