<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;

class Payment_Tabby {
    use Singleton;

    private $secret_key;
    private $merchant_code;
    private $api_base;

    protected function __construct() {
        $this->secret_key    = get_option('tabby_secret_key');
        $this->merchant_code = get_option('tabby_merchant_code');
        $this->api_base      = 'https://api.checkout.com';
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_filter('partnersmanagerpayment/create_payment_intent', [ $this, 'create_payment'   ], 10, 3);
        add_filter('partnersmanagerpayment/verify',                [ $this, 'verify_payment'   ], 10, 3);
        add_filter('partnersmanagerpayment/refund_payment',        [ $this, 'refund_payment'   ], 10, 4);
        add_filter('partnersmanagerpayment/webhook',               [ $this, 'handle_webhook'   ], 10, 1);
        add_filter('partnership/payment/gateways',                 [ $this, 'push_gateways'], 10, 1);
    }

    public function push_gateways($gateways) {
        $gateways['tabby'] = [
            'title' => __('Tabby', 'wp-partnershipm'),
            'icon' => WP_PARTNERSHIPM_BUILD_URI . '/icons/tabby.svg',
        ];
        return $gateways;
    }

    private function curl($path, $params = [], $method = 'POST') {
        $url = "{$this->api_base}/" . ltrim($path, '/');
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, $this->secret_key . ':');
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
        if ($method === 'GET') {
            curl_setopt($ch, CURLOPT_HTTPGET, true);
        }
        $resp = curl_exec($ch);
        curl_close($ch);
        return json_decode($resp, true);
    }

    public function create_payment($null, $args, $provider) {
        if ($provider !== 'tabby') {
            return $null;
        }
        $params = [
            'source'       => ['type' => 'tabby'],
            'amount'       => $args['amount'],
            'currency'     => $args['currency'],
            'capture'      => $args['capture']  ?? true,
            'reference'    => $args['reference'],
            'description'  => $args['description'],
            'customer'     => $args['customer'],
            'items'        => $args['items'],
            'success_url'  => $args['success_url'],
            'failure_url'  => $args['failure_url'],
        ];
        return $this->curl('payments', $params);  // :contentReference[oaicite:0]{index=0}
    }

    public function verify_payment($verified, $data, $provider) {
        if ($provider !== 'tabby') {
            return $verified;
        }
        $resp = $this->curl("payments/{$data['id']}", [], 'GET');
        return isset($resp['status']) && $resp['status'] === 'Paid';  // :contentReference[oaicite:1]{index=1}
    }

    public function refund_payment($false, $payment_id, $args, $provider) {
        if ($provider !== 'tabby') {
            return $false;
        }
        $path   = "payments/{$payment_id}/refunds";
        $params = ['amount' => $args['amount']] + ($args['items'] ?? []);
        return $this->curl($path, $params);  // :contentReference[oaicite:2]{index=2}
    }

    public function handle_webhook($payload) {
        $event   = json_decode($payload, true);
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        do_action('partnersmanagerpayment/tabby_event', $event, $headers);  // :contentReference[oaicite:3]{index=3}
        return $payload;
    }
}
