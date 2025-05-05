<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Contract {
    use Singleton;

    protected function __construct() {
        $this->setup_hooks();
        global $wpdb;
    }

    protected function setup_hooks() {
        add_action('init', [$this, 'add_custom_rewrite']);
        add_action('rest_api_init', [$this, 'register_routes']);
        add_action('template_redirect', [$this, 'handle_pricing_payment_template']);
    }

	public function register_routes() {
		register_rest_route('partnership/v1', '/contracts/packages', [
			'methods' => 'GET',
			'callback' => [$this, 'get_contracts_packages'],
            // 'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/contracts/packages/(?P<package_id>\d+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_contracts_package'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/contracts/packages/(?P<package_id>\d+)/(?P<package_plan>[^/]+)/create', [
			'methods' => 'POST',
			'callback' => [$this, 'create_package_contract'],
            // 'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
	}


    public function add_custom_rewrite() {
        add_rewrite_rule('^pricing/?$', 'index.php?custom_pricing=1', 'top');
        add_rewrite_tag('%custom_pricing%', '([^&]+)');
    }

    public function handle_pricing_payment_template() {
        $pricing_id = get_query_var('custom_pricing');
        if ($pricing_id) {
            include WP_PARTNERSHIPM_DIR_PATH . '/templates/payment-pricing.php';
            exit;
        }
    }
    public function get_contracts_packages(WP_REST_Request $request) {
        // 
        $response = $this->get_packages();
        // 
        return rest_ensure_response($response);
    }
    
    public function get_contracts_package(WP_REST_Request $request) {
        $package_id = (int) $request->get_param('package_id');
        // 
        $packages = $this->get_packages();
        $found_index = array_search($package_id, array_column($packages, 'id'));
        // 
        if ($found_index !== false) {
            $response = $packages[$found_index];
        } else {
            $response = new WP_Error('package_not_found', 'Package with the specified ID not found.', ['status' => 404]);
        }
        // 
        return rest_ensure_response($response);
    }

    public function create_package_contract(WP_REST_Request $request) {
        $package_id = (int) $request->get_param('package_id');
        $package_plan = (string) ucfirst($request->get_param('package_plan'));
        // 
        $packages = $this->get_packages();
        $found_index = array_search($package_id, array_column($packages, 'id'));
        // 
        $response = null;
        // 
        if ($found_index !== false) {
            $package = $packages[$found_index];

            if (isset($package['pricing']) && isset($package['pricing'][$package_plan])) {
                $price = $package['pricing'][$package_plan];
                $payload = [
                    'currency' => $request->get_param('currency'),
                    'client_email' => $request->get_param('client_email'),
                    'total' => $price,
                    'items' => [
                        ['label' => sprintf(__('%s - %s', 'domain'), $package['name'], $package['packagefor']), 'price' => (float) $price]
                    ],
                    'customer' => [
                        'first_name' => $request->get_param('first_name'),
                        'middle_name' => $request->get_param('middle_name'),
                        'last_name' => $request->get_param('last_name'),
                        'phone' => [
                            'countryCode' => $request->get_param('countryCode'),
                            'number' => $request->get_param('client_phone')
                        ]
                    ]
                ];
                $invoice_id = Invoice::get_instance()->create_invoice($payload);
                $response = Invoice::get_instance()->get_invoice($invoice_id);
            }
        }
        if (! $response) {
            $response = new WP_Error('package_not_found', 'Package with the specified ID not found.', ['status' => 404]);
        }
        // 
        return rest_ensure_response($response);
    }
    
    public static function get_packages() {
        return [
            [
                'id' => 1,
                'name' => 'Ecommerce',
                'packagefor' => 'Startup',
                'shortdesc' => 'Customer who just started their business and try to grow',
                'list_title' => "What's included:",
                'icon' => '',
                'list' => [
                    'Social Media Ads Management (1 platform)',
                    'Google Ads Management',
                    'All Conversion Setup',
                    'All Pixel Setup',
                    '5 Post Design / 2 Motion Video',
                    'Whatsapp Marketing',
                    'Email Marketing',
                    'SEO'
                ],
                'pricing' => [
                    // 'Weekly' => 500,
                    // 'Quarterly' => 800,
                    'Monthly' => 1500,
                    'Yearly' => 15000,
                    // 'Lifetime' => 150000
                ]
            ],
            [
                'id' => 2,
                'name' => 'Business',
                'packagefor' => 'Small Business',
                'shortdesc' => 'The business who has stable condition but still trying to grow.',
                'list_title' => "What's included:",
                'icon' => '',
                'list' => [
                    'Social Media Ads Management (1 platform)',
                    'Google Ads Management',
                    'All Conversion Setup',
                    'All Pixel Setup',
                    '10 Post Design / 4 Motion Graphics',
                    'Whatsapp marketing',
                    'Email Marketing',
                    'SEO'
                ],
                'pricing' => [
                    // 'Weekly' => 800,
                    // 'Quarterly' => 1300,
                    'Monthly' => 2500,
                    'Yearly' => 25000,
                    // 'Lifetime' => 250000,
                ]
            ],
            [
                'id' => 3,
                'name' => 'Corporate',
                'packagefor' => 'Corporate Ecommerce',
                'shortdesc' => 'Corporate business packages',
                'list_title' => "What's included:",
                'icon' => '',
                'list' => [
                    'Social Media Ads Management (1 platform)',
                    'Google Ads Management',
                    'All Conversion Setup',
                    'All Pixel Setup',
                    '15 Post Design',
                    '5 Motion Videos',
                    'Whatsapp Marketing',
                    'Email Marketing',
                    'SEO'
                ],
                'pricing' => [
                    // 'Weekly' => 1300,
                    // 'Quarterly' => 2500,
                    'Monthly' => 5000,
                    'Yearly' => 50000,
                    // 'Lifetime' => 500000,
                ]
            ],
            [
                'id' => 4,
                'name' => 'Custom',
                'packagefor' => 'Custom Package',
                'shortdesc' => "Let's discuss your plan of choice",
                'list_title' => "What's included:",
                'icon' => '',
                'list' => [
                    'Custom setup, account provisioning, and dedicated support for complex needs.'
                ],
                'pricing' => []
            ],
        ];
    }
}
