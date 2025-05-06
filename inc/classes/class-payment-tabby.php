<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;

class Payment_Tabby {
    use Singleton;

    private $secret_key;
    private $merchant_code;
    private $api_base;

    protected function __construct() {
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_filter('partnership/payment/gateways',          [ $this, 'push_gateways'], 10, 1);
        add_filter('partnership/payment/gateway/switched',  [ $this, 'switch_gateways'], 10, 3);
        add_filter('tap/payment/charge/payload',            [ $this, 'tap_payment_charge_payload'], 10, 3);
        add_filter('payment/provider/match',                [ $this, 'payment_provider_match'], 10, 3);
    }

    public function push_gateways($gateways) {
        $gateways['tabby'] = [
            'title' => __('Tabby', 'wp-partnershipm'),
            'icon' => WP_PARTNERSHIPM_BUILD_URI . '/icons/tabby.svg',
            'description' => __('Pay via installment with tabby 12 month plan now. buy now pay later. click on [Pay Now] button to proceed.', 'wp-partnershipm'),
            'fields' => [
                ['type' => 'none', 'required' => true]
            ]
        ];
        return $gateways;
    }

    public function switch_gateways($return, $gateway, $user_id) {
        if ($gateway == 'tabby') {
            $return = [
                'type'          => 'installment',
                'customer_id'   => Payment_Tap::get_instance()->get_customer_id(Users::prepare_user_data_for_response(get_userdata($user_id)))
            ];
        }
        return $return;
    }

    public function tap_payment_charge_payload($payload, $args, $gateway) {
        if ($gateway == 'tabby') {
            $payload['source'] = ['id' => 'src_tabby.installement'];
        }
        return $payload;
    }

    public function payment_provider_match($matched, $current, $asked) {
        if ($asked == 'tabby' && $current == 'tap') {
            return true;
        }
        return $matched;
    }
    
}
