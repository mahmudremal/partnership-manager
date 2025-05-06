<?php
/**
 * Bootstraps the Theme.
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;

class Project {
	use Singleton;

	public static $tables = [
        // 'tools_service',
    ];

	/**
	 * Constructor for the Project class.
	 * Loads necessary classes and sets up hooks.
	 */
	protected function __construct() {
		// Load class instances.
		Task::get_instance();
		Error::get_instance();
		Users::get_instance();
		Menus::get_instance();
		Option::get_instance();
		Assets::get_instance();
		Invoice::get_instance();
		Finance::get_instance();
		Payment::get_instance();
		Referral::get_instance();
		Security::get_instance();
		Frontend::get_instance();
		Contract::get_instance();
		Manifest::get_instance();
		Currency::get_instance();
		Shortcode::get_instance();
		Admin_Menu::get_instance();
		Translations::get_instance();
		Notifications::get_instance();

		Payment_Tap::get_instance();
		Payment_Tabby::get_instance();
		// Payment_Stripe::get_instance();
		// Payment_Sslcommerz::get_instance();
        // 
		// Uncomment the following line if setup_hooks needs to be called.
		$this->setup_hooks();
	}

	/**
	 * Sets up WordPress hooks for the project.
	 */
	protected function setup_hooks() {
		add_action( 'init', [ $this, 'init' ], 1, 0 );
		register_activation_hook( WP_PARTNERSHIPM__FILE__, [ $this, 'register_activation_hook' ] );
		register_deactivation_hook( WP_PARTNERSHIPM__FILE__, [ $this, 'register_deactivation_hook' ] );
	}

	/**
	 * Initializes the plugin.
	 * Loads the text domain for localization.
	 */
	public function init() {
		load_plugin_textdomain( 'wp-partnershipm', false, dirname( plugin_basename( WP_PARTNERSHIPM__FILE__ ) ) . '/languages' );		
	}

	/**
	 * Handles tasks to be performed on plugin activation.
	 */
	public function register_activation_hook() {
		flush_rewrite_rules();
		// $this->create_tables();
	}

	/**
	 * Handles tasks to be performed on plugin deactivation.
	 */
	public function register_deactivation_hook() {
		// Perform cleanup tasks here.
		// $this->drop_tables();
	}

	
    public static function create_tables() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        $table_structures = [
            'tools_package' => "
            {{table}} (
                id mediumint(9) NOT NULL AUTO_INCREMENT,
                title text NOT NULL,
                description text NOT NULL,
                currency mediumint NOT NULL,
                price mediumint(9) NOT NULL,
                PRIMARY KEY  (id)
            ) $charset_collate;",
        ];

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

        $table4replace = [];$table2replace = [];
        foreach (self::$tables as $table) {
            $table_name = $wpdb->prefix . $table;
            $table4replace[] = sprintf('{{%s}}', $table);
            $table2replace[] = $table_name;
        }
        
        foreach (self::$tables as $table) {
            $table_name = $wpdb->prefix . $table;
            $sql = str_replace('{{table}}', $table_name, $table_structures[$table]);
            $sql = str_replace($table4replace, $table2replace, $sql);
            dbDelta("CREATE TABLE IF NOT EXISTS " . $sql);
            // print_r("CREATE TABLE IF NOT EXISTS " . $sql);
        }
        // wp_die('Remal Mahmud');
    }
    public static function drop_tables() {
        global $wpdb;
        foreach (self::$tables as $table) {
            $wpdb->query("DROP TABLE IF EXISTS " . $wpdb->prefix . $table);
        }
    }
}
