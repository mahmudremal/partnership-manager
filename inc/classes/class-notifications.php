<?php
/**
 * Rest API classes
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;

class Notifications {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
        add_filter( 'partnershipmang/siteconfig', [ $this, 'siteConfig' ], 1, 1 );
        add_action('woocommerce_thankyou', 'send_new_order_notification', 10, 1);
	}
    public function siteConfig($args) {
        if (!is_array($args)) {$args = [];}
        $args['subscibed'] = $this->is_subscribed();
        $args['sw_uri'] = WP_PARTNERSHIPM_DIR_URI . '/service-worker.js';
        return $args;
    }
    public function is_subscribed() {
        if (is_user_logged_in()) {
            return get_user_meta(get_current_user_id(), '_push_notif', true);
        }
        return false;
    }

    public function send_new_order_notification($order_id) {
        global $wpdb;
        if (!$order_id) return;
        $order = wc_get_order($order_id);
        $status = $order->get_status();
        if (in_array($status, ['processing', 'on-hold'])) {
            $user_ids = $wpdb->get_results("SELECT user_id, meta_value FROM {$wpdb->usermeta} WHERE meta_key = '_push_notif' AND meta_value <> ''");
            $this->send_notification([
                "title" => "New Notification",
                "body" => 'A new order has been placed on your site. Order ID: ' . $order_id
            ]);
        }
    }
    public function send_notification($args) {
        // 
    }
    
}
