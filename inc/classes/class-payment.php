<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;

class Payment {
    use Singleton;

    private $post_data;

    protected function __construct() {
        $this->post_data = [];
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('init', [ $this, 'register_post_type' ]);
        add_action('init', [ $this, 'add_payment_pages' ]);
        add_filter('query_vars', [ $this, 'query_vars' ]);
        add_filter('template_include', [ $this, 'payment_status_template' ]);
        add_action('wp_ajax_nopriv_payment_webhook', [ $this, 'handle_webhook' ]);
        add_action('wp_ajax_payment_webhook', [ $this, 'handle_webhook' ]);
    }

    public function register_post_type() {
        register_post_type('partner_payments', [
            'label'       => 'Partner Payments',
            'public'      => false,
            'show_ui'     => false,
            'supports'    => [],
        ]);
    }

    public function add_payment_pages() {
        add_rewrite_endpoint('payment-status', EP_PAGES);
    }

    public function query_vars($vars) {
        $vars[] = 'payment-status';
        return $vars;
    }

    public function payment_status_template($template) {
        if (get_query_var('payment-status') !== '') {
            $file = plugin_dir_path(__DIR__) . 'templates/payment-status.php';
            return file_exists($file) ? $file : $template;
        }
        return $template;
    }

    public function create_payment_intent($args, $provider) {
        $post_id = $this->insert_record('intent', $args, $provider);
        $result = apply_filters('partnersmanagerpayment/create_payment_intent', null, $args, $provider);
        $this->update_record($post_id, ['result' => $result]);
        return $result;
    }

    public function get_payment_status($status, $args) {
        $post_id = $this->insert_record('status', $args, '');
        $new_status = apply_filters('partnersmanagerpayment/status', $status, $args);
        $this->update_record($post_id, ['status' => $new_status]);
        return $new_status;
    }

    public function verify_payment($data, $provider) {
        $post_id = $this->insert_record('verify', $data, $provider);
        $verified = apply_filters('partnersmanagerpayment/verify', false, $data, $provider);
        $this->update_record($post_id, ['verified' => $verified]);
        return $verified;
    }

    public function create_subscription($args, $provider) {
        $post_id = $this->insert_record('subscription', $args, $provider);
        $subscription = apply_filters('partnersmanagerpayment/create_subscription', null, $args, $provider);
        do_action('partnersmanagerpayment/subscription_created', $subscription, $args, $provider, $post_id);
        $this->update_record($post_id, ['subscription' => $subscription]);
        return $subscription;
    }

    public function pause_subscription($subscription_id, $provider) {
        $is_paused = apply_filters('partnersmanagerpayment/pause_subscription', false, $subscription_id, $provider);
        do_action('partnersmanagerpayment/subscription_paused', $is_paused, $subscription_id, $provider);
        return $is_paused;
    }

    public function resume_subscription($subscription_id, $provider) {
        $is_resumed = apply_filters('partnersmanagerpayment/resume_subscription', false, $subscription_id, $provider);
        do_action('partnersmanagerpayment/subscription_resumed', $is_resumed, $subscription_id, $provider);
        return $is_resumed;
    }

    public function cancel_subscription($subscription_id, $provider) {
        $is_cancelled = apply_filters('partnersmanagerpayment/cancel_subscription', false, $subscription_id, $provider);
        do_action('partnersmanagerpayment/subscription_cancelled', $is_cancelled, $subscription_id, $provider);
        return $is_cancelled;
    }

    public function refund_payment($payment_id, $args, $provider) {
        $is_refunded = apply_filters('partnersmanagerpayment/refund_payment', false, $payment_id, $args, $provider);
        do_action('partnersmanagerpayment/subscription_refunded', $is_refunded, $subscription_id, $provider, $args);
        return $is_refunded;
    }

    public function handle_webhook() {
        $payload = file_get_contents('php://input');
        apply_filters('partnersmanagerpayment/webhook', $payload);
        status_header(200);
        exit;
    }

    protected function insert_record($type, $data, $provider) {
        $post_id = wp_insert_post([
            'post_type'   => 'partner_payments',
            'post_status' => 'publish',
            'post_title'  => ucfirst($type) . ' - ' . time(),
        ]);
        if ($post_id) {
            update_post_meta($post_id, 'type', $type);
            update_post_meta($post_id, 'provider', $provider);
            update_post_meta($post_id, 'data', $data);
        }
        return $post_id;
    }

    protected function update_record($post_id, $fields) {
        foreach ($fields as $key => $value) {
            update_post_meta($post_id, $key, $value);
        }
    }
}
