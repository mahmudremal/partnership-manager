<?php
/**
 * Error handling class
 * Will be used to store error data.
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Response;
use WP_Error;
use WP_REST_Request;
use WPDB;

class Error {
    use Singleton;

    protected $table_name;

    protected function __construct() {
        $this->setup_hooks();
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'error_reports'; // Define the table for storing errors
    }

    protected function setup_hooks() {
        add_action('rest_api_init', [$this, 'register_error_reporting_endpoint']);
        // Register activation and deactivation hooks
        register_activation_hook( WP_PARTNERSHIPM__FILE__, [$this, 'register_activation_hook'] );
        register_deactivation_hook( WP_PARTNERSHIPM__FILE__, [$this, 'register_deactivation_hook'] );
    }

    // Activation hook to create the table
    public function register_activation_hook() {
        $this->create_error_table();
    }

    // Deactivation hook to drop the table
    public function register_deactivation_hook() {
        $this->drop_error_table();
    }

    // Create the error report table if it doesn't exist
    private function create_error_table() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS {$this->table_name} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            error_subject VARCHAR(255) NOT NULL,
            error_message TEXT NOT NULL,
            error_platform VARCHAR(100) NOT NULL,
            status ENUM('unresolved', 'solved') DEFAULT 'unresolved',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) $charset_collate;";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }

    // Drop the error report table when the plugin is deactivated
    private function drop_error_table() {
        global $wpdb;
        $sql = "DROP TABLE IF EXISTS {$this->table_name};";
        $wpdb->query($sql);
    }

    // Register REST API endpoint for error reporting
    public function register_error_reporting_endpoint() {
        register_rest_route('partnership/v1', '/error/report', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_error_report'],
            // 'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
    }

    // Handle the incoming error reports from the client
    public function handle_error_report(WP_REST_Request $request) {
        $error_subject = sanitize_text_field($request->get_param('error_subject'));
        $error_message = sanitize_textarea_field($request->get_param('error_message'));
        $error_platform = sanitize_text_field($request->get_param('error_platform'));

        if (empty($error_subject) || empty($error_message)) {
            return new WP_Error('missing_fields', 'Error subject and message are required', ['status' => 400]);
        }

        // Check if this error already exists and is unresolved
        global $wpdb;
        $existing_error = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->table_name} WHERE error_subject = %s AND error_message = %s AND status = 'unresolved'",
                $error_subject, $error_message
            )
        );

        if ($existing_error) {
            return new WP_REST_Response('Duplicate error report. This error is already being reviewed.', 200);
        }

        // Insert new error report
        // $wpdb->insert(
        //     $this->table_name,
        //     [
        //         'error_subject' => $error_subject,
        //         'error_message' => $error_message,
        //         'error_platform' => $error_platform,
        //         'created_at' => current_time('mysql'),
        //         'status' => 'unresolved'
        //     ]
        // );

        return new WP_REST_Response('Error report submitted successfully.', 200);
    }
}
