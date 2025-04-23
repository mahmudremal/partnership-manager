<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;

class Payment_Tap {
    use Singleton;

    private $secret_key;
    private $api_base = 'https://api.tap.company/';

    protected function __construct() {
        $this->secret_key = get_option('tap_secret_key');
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_filter('partnersmanagerpayment/create_payment_intent', [ $this, 'tap_create_charge' ], 10, 3);
        add_filter('partnersmanagerpayment/verify',                [ $this, 'tap_verify'        ], 10, 3);
        add_filter('partnersmanagerpayment/refund_payment',        [ $this, 'tap_refund'        ], 10, 4);
        add_filter('partnersmanagerpayment/webhook',               [ $this, 'tap_handle_webhook'], 10, 1);
    }

    private function request(string $path, array $data = [], string $method = 'POST') {
        $url = rtrim($this->api_base, '/') . '/' . ltrim($path, '/');
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->secret_key,
            'Content-Type: application/json',
        ]);
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'GET') {
            curl_setopt($ch, CURLOPT_HTTPGET, true);
        }
        $resp = curl_exec($ch);
        curl_close($ch);
        return json_decode($resp, true);
    }

    public function tap_create_charge($null, $args, $provider) {
        if ($provider !== 'tap') {
            return $null;
        }
        $payload = [
            'amount'            => $args['amount'],
            'currency'          => $args['currency'],
            'customer_initiated'=> $args['customer_initiated'] ?? true,
            'threeDSecure'      => $args['threeDSecure']       ?? false,
            'save_card'         => $args['save_card']          ?? false,
            'description'       => $args['description']        ?? '',
            'metadata'          => $args['metadata']           ?? [],
            'reference'         => $args['reference']          ?? [],
            'receipt'           => $args['receipt']            ?? [],
        ];
        return $this->request('v2/charges', $payload);  // :contentReference[oaicite:0]{index=0}
    }

    public function tap_verify($verified, $data, $provider) {
        if ($provider !== 'tap') {
            return $verified;
        }
        $resp = $this->request("v2/charges/{$data['id']}", [], 'GET');  // :contentReference[oaicite:1]{index=1}
        return isset($resp['status']) && $resp['status'] === 'CAPTURED';
    }

    public function tap_refund($false, $payment_id, $args, $provider) {
        if ($provider !== 'tap') {
            return $false;
        }
        $payload = [
            'charge_id' => $payment_id,
            'amount'    => $args['amount'],
            'reason'    => $args['reason'] ?? '',
        ];
        return $this->request('v2/refunds', $payload);  // :contentReference[oaicite:2]{index=2}
    }

    public function tap_handle_webhook($payload) {
        $event   = json_decode($payload, true);
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        do_action('partnersmanagerpayment/tap_event', $event, $headers);  // :contentReference[oaicite:3]{index=3}
        return $payload;
    }
}





// namespace PARTNERSHIP_MANAGER\inc;
// use PARTNERSHIP_MANAGER\inc\Traits\Singleton;

// class Payment_Tap {
//     use Singleton;

//     private $secret_key;
//     private $api_base = 'https://api.tap.company/';

//     protected function __construct() {
//         $this->secret_key = get_option('tap_secret_key');
//         $this->setup_hooks();
//     }

//     protected function setup_hooks() {
//         add_filter('partnersmanagerpayment/create_payment_intent',   [ $this, 'tap_create_charge'           ], 10, 3);
//         add_filter('partnersmanagerpayment/verify',                  [ $this, 'tap_verify'                  ], 10, 3);
//         add_filter('partnersmanagerpayment/refund_payment',          [ $this, 'tap_refund'                  ], 10, 4);
//         add_filter('partnersmanagerpayment/create_subscription',     [ $this, 'tap_create_subscription'     ], 10, 3);
//         add_filter('partnersmanagerpayment/pause_subscription',      [ $this, 'tap_pause_subscription'      ], 10, 2);
//         add_filter('partnersmanagerpayment/resume_subscription',     [ $this, 'tap_resume_subscription'     ], 10, 2);
//         add_filter('partnersmanagerpayment/cancel_subscription',     [ $this, 'tap_cancel_subscription'     ], 10, 2);
//         add_filter('cron_schedules',                                  [ $this, 'add_cron_schedules'          ]);
//         add_action('partnersmanagerpayment/tap_recurring_charge',    [ $this, 'tap_process_recurring_charge'], 10, 1);
//     }

//     // expose daily, weekly, monthly intervals
//     public function add_cron_schedules($schedules) {
//         $schedules['weekly']  = ['interval' => 7 * 24 * 3600,   'display' => 'Once Weekly'];
//         $schedules['monthly'] = ['interval' => 30 * 24 * 3600,  'display' => 'Once Monthly'];
//         return $schedules;
//     }

//     private function request(string $path, array $data = [], string $method = 'POST') {
//         $url = rtrim($this->api_base, '/') . '/' . ltrim($path, '/');
//         $ch = curl_init($url);
//         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//         curl_setopt($ch, CURLOPT_HTTPHEADER, [
//             'Authorization: Bearer ' . $this->secret_key,
//             'Content-Type: application/json',
//         ]);
//         if ($method === 'POST') {
//             curl_setopt($ch, CURLOPT_POST, true);
//             curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
//         } elseif ($method === 'GET') {
//             curl_setopt($ch, CURLOPT_HTTPGET, true);
//         }
//         $resp = curl_exec($ch);
//         curl_close($ch);
//         return json_decode($resp, true);
//     }

//     public function tap_create_charge($null, $args, $provider) {
//         if ($provider !== 'tap') {
//             return $null;
//         }
//         $payload = [
//             'amount'            => $args['amount'],
//             'currency'          => $args['currency'],
//             'save_card'         => $args['save_card']    ?? false,   // :contentReference[oaicite:0]{index=0}
//             'threeDSecure'      => $args['threeDSecure'] ?? false,
//             'customer'          => $args['customer']     ?? [],
//             'metadata'          => $args['metadata']     ?? [],
//         ];
//         return $this->request('v2/charges', $payload);
//     }

//     public function tap_verify($verified, $data, $provider) {
//         if ($provider !== 'tap') {
//             return $verified;
//         }
//         $resp = $this->request("v2/charges/{$data['id']}", [], 'GET');  // :contentReference[oaicite:1]{index=1}
//         return isset($resp['status']) && $resp['status'] === 'CAPTURED';
//     }

//     public function tap_refund($false, $payment_id, $args, $provider) {
//         if ($provider !== 'tap') {
//             return $false;
//         }
//         $payload = [
//             'charge_id' => $payment_id,
//             'amount'    => $args['amount'],
//             'reason'    => $args['reason'] ?? '',
//         ];
//         return $this->request('v2/refunds', $payload);  // 
//     }

//     public function tap_create_subscription($null, $args, $provider) {
//         if ($provider !== 'tap') {
//             return $null;
//         }
//         // initial charge and save card for recurring :contentReference[oaicite:2]{index=2}
//         $payload = [
//             'amount'       => $args['amount'],
//             'currency'     => $args['currency'],
//             'save_card'    => true,
//             'threeDSecure' => false,
//             'customer'     => $args['customer']  ?? [],
//             'metadata'     => ['interval' => $args['interval']],
//         ];
//         $resp = $this->request('v2/charges', $payload);

//         // extract saved card & customer
//         $card_id     = $resp['card']['id']     ?? null;
//         $customer_id = $resp['customer']['id'] ?? null;

//         // record subscription in WP
//         $post_id = wp_insert_post([
//             'post_type'   => 'partner_payments',
//             'post_title'  => 'tap_sub_' . uniqid(),
//             'post_status' => 'publish',
//         ]);
//         update_post_meta($post_id, 'type',        'subscription');
//         update_post_meta($post_id, 'provider',    'tap');
//         update_post_meta($post_id, 'amount',      $args['amount']);
//         update_post_meta($post_id, 'currency',    $args['currency']);
//         update_post_meta($post_id, 'interval',    $args['interval']);
//         update_post_meta($post_id, 'card_id',     $card_id);
//         update_post_meta($post_id, 'customer_id', $customer_id);
//         update_post_meta($post_id, 'status',      'active');

//         // schedule first recurring charge
//         $when = time() + $this->interval_to_seconds($args['interval']);
//         wp_schedule_event($when, $args['interval'], 'partnersmanagerpayment/tap_recurring_charge', [ $post_id ]);

//         return $resp;
//     }

//     public function tap_process_recurring_charge($post_id) {
//         $status   = get_post_meta($post_id, 'status', true);
//         if ($status !== 'active') {
//             return;
//         }
//         $amount   = get_post_meta($post_id, 'amount', true);
//         $currency = get_post_meta($post_id, 'currency', true);
//         $card_id  = get_post_meta($post_id, 'card_id', true);
//         $customer = ['id' => get_post_meta($post_id, 'customer_id', true)];

//         $payload = [
//             'amount'       => $amount,
//             'currency'     => $currency,
//             'customer'     => $customer,
//             'card'         => ['id' => $card_id],
//             'save_card'    => false,
//             'threeDSecure' => false,
//         ];
//         $charge = $this->request('v2/charges', $payload);
//         // log this attempt
//         update_post_meta($post_id, 'last_charge', $charge);

//         // schedule next run
//         $interval = get_post_meta($post_id, 'interval', true);
//         $next     = time() + $this->interval_to_seconds($interval);
//         wp_schedule_event($next, $interval, 'partnersmanagerpayment/tap_recurring_charge', [ $post_id ]);
//     }

//     public function tap_pause_subscription($false, $subscription_id, $provider) {
//         if ($provider !== 'tap') {
//             return $false;
//         }
//         $post_id = $subscription_id;
//         update_post_meta($post_id, 'status', 'paused');
//         wp_clear_scheduled_hook('partnersmanagerpayment/tap_recurring_charge', [ $post_id ]);
//         return true;
//     }

//     public function tap_resume_subscription($false, $subscription_id, $provider) {
//         if ($provider !== 'tap') {
//             return $false;
//         }
//         $post_id = $subscription_id;
//         update_post_meta($post_id, 'status', 'active');
//         $interval = get_post_meta($post_id, 'interval', true);
//         $when     = time() + $this->interval_to_seconds($interval);
//         wp_schedule_event($when, $interval, 'partnersmanagerpayment/tap_recurring_charge', [ $post_id ]);
//         return true;
//     }

//     public function tap_cancel_subscription($false, $subscription_id, $provider) {
//         if ($provider !== 'tap') {
//             return $false;
//         }
//         $post_id = $subscription_id;
//         update_post_meta($post_id, 'status', 'cancelled');
//         wp_clear_scheduled_hook('partnersmanagerpayment/tap_recurring_charge', [ $post_id ]);
//         return true;
//     }

//     private function interval_to_seconds($interval) {
//         switch ($interval) {
//             case 'hourly':  return 3600;
//             case 'daily':   return 24 * 3600;
//             case 'weekly':  return 7 * 24 * 3600;
//             case 'monthly': return 30 * 24 * 3600;
//             default:        return intval($interval);
//         }
//     }

//     public function tap_handle_webhook($payload) {
//         $event   = json_decode($payload, true);
//         $headers = function_exists('getallheaders') ? getallheaders() : [];
//         do_action('partnersmanagerpayment/tap_event', $event, $headers);
//         return $payload;
//     }
// }
