<?php
/**
 * Rest API classes
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;

class Payment {
	use Singleton;

    private $post_data;

	protected function __construct() {
		// Load class.
        $this->post_data = array();
		$this->setup_hooks();
	}
	protected function setup_hooks() {
        // add_filter('partnersmanagerpayment/get_payment_intent', [$this, 'create_payment_request'], 2, 2);
        // add_filter('partnersmanagerpayment/status', [$this, 'get_payment_status'], 10, 2);
        // add_filter('partnersmanagerpayment/verify', [$this, 'verify_payment'], 10, 2);
        // add_filter('partnersmanagerget_currencies', [$this, 'get_currencies'], 10, 2);
        // // 
        // add_action('init', array($this, 'add_payment_pages'));
        // add_filter('query_vars', array($this, 'query_vars'));
        // add_filter('template_include', array($this, 'payment_status_template'));
	}
    
    public function add_payment_pages() {
        add_rewrite_rule('partnersmanagerpayment/(success|fail|cancel)/?$', 'index.php?protools_payment_status=$matches[1]', 'top');
        // flush_rewrite_rules();
    }
    public function query_vars( $query_vars  ) {
		$query_vars[] = 'protools_payment_status';
		return $query_vars;
	}
    public function payment_status_template($template) {
        $payment_status = get_query_var('protools_payment_status');
        if ( $payment_status == false || $payment_status == '' ) {
            return $template;
        } else {
            $template = WP_PARTNERSHIPM_DIR_PATH . '/templates/payment-status-template.php';
        }
        return $template;
    }

    public function create_payment_request($redirect_url, $args) {
        $this->post_data = wp_parse_args($args, [
            'store_id' => "testbox",
            'store_passwd' => "qwerty",
            'total_amount' => "103",
            'currency' => "BDT",
            'tran_id' => "SSLCZ_TEST_".uniqid(),
            'success_url' => site_url('/partnersmanagerpayment/success'),
            'fail_url' => site_url('/partnersmanagerpayment/fail'),
            'cancel_url' => site_url('/partnersmanagerpayment/cancel'),
            'emi_option' => "0", // 1
            // 'emi_max_inst_option' => "N/A", // Commented out dummy field
            // 'emi_selected_inst' => "N/A", // Commented out dummy field
            'cus_name' => "Test Customer",
            'cus_email' => "test@test.com",
            'cus_add1' => "Dhaka",
            'cus_add2' => "Dhaka",
            'cus_city' => "Dhaka",
            'cus_state' => "Dhaka",
            'cus_postcode' => "1000",
            'cus_country' => "Bangladesh",
            'cus_phone' => "01711111111",
            'cus_fax' => "01711111111",
            'ship_name' => "Store Test",
            'ship_add1' => "Dhaka",
            'ship_add2' => "Dhaka",
            'ship_city' => "Dhaka",
            'ship_state' => "Dhaka",
            'ship_postcode' => "1000",
            'ship_country' => "Bangladesh",
            'value_a' => "N/A",
            'value_b' => "N/A",
            'value_c' => "N/A",
            'value_d' => "N/A",
            'cart' => json_encode(array(
                array("product"=>"N/A","amount"=>"103")
            )),
            'product_amount' => "103",
            'vat' => "0",
            'discount_amount' => "0",
            'convenience_fee' => "0"
        ]);
        // Implement the logic to send the payment request
        $direct_api_url = "https://sandbox.sslcommerz.com/gwprocess/v3/api.php";

        $handle = curl_init();
        curl_setopt($handle, CURLOPT_URL, $direct_api_url );
        curl_setopt($handle, CURLOPT_TIMEOUT, 30);
        curl_setopt($handle, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($handle, CURLOPT_POST, 1 );
        curl_setopt($handle, CURLOPT_POSTFIELDS, $this->post_data);
        curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, FALSE); # KEEP IT FALSE IF YOU RUN FROM LOCAL PC

        $content = curl_exec($handle );

        $code = curl_getinfo($handle, CURLINFO_HTTP_CODE);

        if($code == 200 && !( curl_errno($handle))) {
            curl_close( $handle);
            $sslcommerzResponse = $content;
        } else {
            curl_close( $handle);
            return $redirect_url;
        }
        
        $sslcz = json_decode($sslcommerzResponse, true );

        return ($sslcz['GatewayPageURL'] && $sslcz['GatewayPageURL'] != '') ? $sslcz['GatewayPageURL'] : $redirect_url;
    }
    public function verify_payment($status, $args) {
        // Assuming $args contains the necessary payment details such as transaction ID
        $tran_id = $args['tran_id'];
        // Simulate a verification process by checking the transaction ID against a database or a third-party service
        // For demonstration, let's assume we have a function to simulate the verification
        $verified = $this->simulate_verification($tran_id);
        if ($verified) {
            return true; // Payment is verified
        } else {
            return false; // Payment verification failed
        }
    }

    public function get_payment_status($status, $args) {
        // Assuming $args contains the necessary payment details such as transaction ID
        $tran_id = $args['tran_id'];
        // Simulate a status check process by checking the transaction ID against a database or a third-party service
        // For demonstration, let's assume we have a function to simulate the status check
        $status = $this->simulate_status_check($tran_id);
        return $status; // Return the payment status
    }

    // Simulate verification and status check functions for demonstration
    private function simulate_verification($tran_id) {
        // This is a placeholder for actual verification logic
        // For demonstration, let's assume the transaction ID is valid if it's not empty
        return !empty($tran_id);
    }

    private function simulate_status_check($tran_id) {
        // This is a placeholder for actual status check logic
        // For demonstration, let's assume the status is 'success' if the transaction ID is not empty
        if (!empty($tran_id)) {
            return 'success';
        } else {
            return 'failed';
        }
    }

    public function get_currencies($default = null, $code = 'BDT') {
        $currencies = [
            'AED' => ['L', 'د.إ'],
            'AFN' => ['L', '؋'],
            'ALL' => ['L', 'L'],
            'AMD' => ['L', '֏'],
            'ANG' => ['L', 'ƒ'],
            'AOA' => ['L', 'Kz'],
            'ARS' => ['L', '$'],
            'AUD' => ['L', '$'],
            'AWG' => ['L', 'ƒ'],
            'AZN' => ['L', '₼'],
            'BAM' => ['L', 'KM'],
            'BBD' => ['L', '$'],
            'BDT' => ['L', '৳'],
            'BGN' => ['L', 'лв'],
            'BHD' => ['L', '.د.ب'],
            'BIF' => ['L', 'FBu'],
            'BMD' => ['L', '$'],
            'BND' => ['L', '$'],
            'BOB' => ['L', 'Bs'],
            'BRL' => ['L', 'R$'],
            'BSD' => ['L', '$'],
            'BTN' => ['L', 'Nu'],
            'BWP' => ['L', 'P'],
            'BYN' => ['L', 'Br'],
            'BZD' => ['L', '$'],
            'CAD' => ['L', '$'],
            'CDF' => ['L', 'FC'],
            'CHF' => ['L', 'CHF'],
            'CLP' => ['L', '$'],
            'CNY' => ['L', '¥'],
            'COP' => ['L', '$'],
            'CRC' => ['L', '₡'],
            'CUC' => ['L', '$'],
            'CUP' => ['L', '₱'],
            'CVE' => ['L', 'Esc'],
            'CZK' => ['L', 'Kč'],
            'DJF' => ['L', 'Fdj'],
            'DKK' => ['L', 'kr'],
            'DOP' => ['L', 'RD$'],
            'DZD' => ['L', 'د.ج'],
            'EGP' => ['L', '£'],
            'ERN' => ['L', 'Nfk'],
            'ETB' => ['L', 'Br'],
            'EUR' => ['L', '€'],
            'FJD' => ['L', '$'],
            'FKP' => ['L', '£'],
            'GBP' => ['L', '£'],
            'GEL' => ['L', '₾'],
            'GHS' => ['L', '₵'],
            'GIP' => ['L', '£'],
            'GMD' => ['L', 'D'],
            'GNF' => ['L', 'FG'],
            'GTQ' => ['L', 'Q'],
            'GYD' => ['L', '$'],
            'HKD' => ['L', '$'],
            'HNL' => ['L', 'L'],
            'HRK' => ['L', 'kn'],
            'HTG' => ['L', 'G'],
            'HUF' => ['L', 'Ft'],
            'IDR' => ['L', 'Rp'],
            'ILS' => ['L', '₪'],
            'INR' => ['L', '₹'],
            'IQD' => ['L', 'ع.د'],
            'IRR' => ['L', '﷼'],
            'ISK' => ['L', 'kr'],
            'JMD' => ['L', '$'],
            'JOD' => ['L', 'د.أ'],
            'JPY' => ['L', '¥'],
            'KES' => ['L', 'Sh'],
            'KGS' => ['L', 'сом'],
            'KHR' => ['L', '៛'],
            'KMF' => ['L', 'FC'],
            'KPW' => ['L', '₩'],
            'KRW' => ['L', '₩'],
            'KWD' => ['L', 'د.ك'],
            'KYD' => ['L', '$'],
            'KZT' => ['L', '₸'],
            'LAK' => ['L', '₭'],
            'LBP' => ['L', 'ل.ل'],
            'LKR' => ['L', '₨'],
            'LRD' => ['L', '$'],
            'LSL' => ['L', 'M'],
            'LYD' => ['L', 'ل.د'],
            'MAD' => ['L', 'د.م.'],
            'MDL' => ['L', 'L'],
            'MGA' => ['L', 'Ar'],
            'MKD' => ['L', 'ден'],
            'MMK' => ['L', 'K'],
            'MNT' => ['L', '₮'],
            'MOP' => ['L', 'P'],
            'MRO' => ['L', 'UM'],
            'MUR' => ['L', '₨'],
            'MVR' => ['L', 'ރ.'],
            'MWK' => ['L', 'MK'],
            'MXN' => ['L', '$'],
            'MYR' => ['L', 'RM'],
            'MZN' => ['L', 'MT'],
            'NAD' => ['L', '$'],
            'NGN' => ['L', '₦'],
            'NIO' => ['L', 'C$'],
            'NOK' => ['L', 'kr'],
            'NPR' => ['L', '₨'],
            'NZD' => ['L', '$'],
            'OMR' => ['L', 'ر.ع.'],
            'PAB' => ['L', 'B/'],
            'PEN' => ['L', 'S/'],
            'PGK' => ['L', 'K'],
            'PHP' => ['L', '₱'],
            'PKR' => ['L', '₨'],
            'PLN' => ['L', 'zł'],
            'PYG' => ['L', '₲'],
            'QAR' => ['L', 'ر.ق'],
            'RON' => ['L', 'lei'],
            'RSD' => ['L', 'дин'],
            'RUB' => ['L', '₽'],
            'RWF' => ['L', 'R₣'],
            'SAR' => ['L', 'ر.س'],
            'SBD' => ['L', '$'],
            'SCR' => ['L', '₨'],
            'SDG' => ['L', 'ج.س.'],
            'SEK' => ['L', 'kr'],
            'SGD' => ['L', '$'],
            'SHP' => ['L', '£'],
            'SLL' => ['L', 'Le'],
            'SOS' => ['L', 'Sh'],
            'SRD' => ['L', '$'],
            'SSP' => ['L', '£'],
            'STD' => ['L', 'Db'],
            'SVC' => ['L', '$'],
            'SYP' => ['L', 'ل.س'],
            'SZL' => ['L', 'E'],
            'THB' => ['L', '฿'],
            'TJS' => ['L', 'ЅМ'],
            'TMT' => ['L', 'T'],
            'TND' => ['L', 'د.ت'],
            'TOP' => ['L', 'T$'],
            'TRY' => ['L', '₺'],
            'TTD' => ['L', '$'],
            'TWD' => ['L', 'NT$'],
            'TZS' => ['L', 'Sh'],
            'UAH' => ['L', '₴'],
            'UGX' => ['L', 'Sh'],
            'USD' => ['L', '$'],
            'USN' => ['L', '$'],
            'USS' => ['L', '$'],
        ];
        return $code ? $currencies[strtoupper($code)] : $currencies;
    }
    
}
