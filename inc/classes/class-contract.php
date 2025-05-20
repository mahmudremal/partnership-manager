<?php
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Contract {
    use Singleton;

    protected $contract_table;
    protected $column_table;
    protected $card_table;
    protected $checklist_table;
    protected $comment_table;
    protected $attachment_table;

    protected function __construct() {
        global $wpdb;
        $this->contract_table = $wpdb->prefix . 'partnership_contracts';
        $this->column_table = $wpdb->prefix . 'partnership_contract_columns';
        $this->card_table = $wpdb->prefix . 'partnership_contract_cards';
        $this->checklist_table = $wpdb->prefix . 'partnership_contract_checklists';
        $this->comment_table = $wpdb->prefix . 'partnership_contract_comments';
        $this->attachment_table = $wpdb->prefix . 'partnership_contract_attachments';
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('init', [$this, 'add_custom_rewrite']);
        add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('partnership/invoice/paid', [$this, 'invoice_paid'], 10, 3);
        add_action('template_redirect', [$this, 'handle_pricing_payment_template']);
        register_activation_hook(WP_PARTNERSHIPM__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook( WP_PARTNERSHIPM__FILE__, [$this, 'register_deactivation_hook'] );
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
            'permission_callback' => function($request) {
                $_proven = Security::get_instance()->permission_callback(false);
                return true;
            }
		]);


        // Contract or project board api starts here
        
		register_rest_route('partnership/v1', '/contracts', [
			'methods' => 'GET',
			'callback' => [$this, 'get_api_contracts'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
        register_rest_route('partnership/v1', '/contracts/(?P<contract_id>\\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_api_contract'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/contract', [
            'methods' => 'POST',
            'callback' => [$this, 'api_create_contract'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/contract/(?P<contract_id>\\d+)/columns', [
            'methods' => 'GET',
            'callback' => [$this, 'get_contract_columns'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/contract/(?P<contract_id>\\d+)/column', [
            'methods' => 'POST',
            'callback' => [$this, 'create_column'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/column/(?P<column_id>\\d+)/cards', [
            'methods' => 'GET',
            'callback' => [$this, 'get_column_cards'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/column/(?P<column_id>\\d+)/card', [
            'methods' => 'POST',
            'callback' => [$this, 'create_card'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/card/(?P<card_id>\\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_card_detail'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/card/(?P<card_id>\\d+)/checklist', [
            'methods' => 'POST',
            'callback' => [$this, 'create_checklist_item'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/card/(?P<card_id>\\d+)/checklists', [
            'methods' => 'GET',
            'callback' => [$this, 'get_card_checklists'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/card/(?P<card_id>\\d+)/comment', [
            'methods' => 'POST',
            'callback' => [$this, 'add_card_comment'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/card/(?P<card_id>\\d+)/comments', [
            'methods' => 'GET',
            'callback' => [$this, 'get_card_comments'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/card/(?P<card_id>\\d+)/attachment', [
            'methods' => 'POST',
            'callback' => [$this, 'upload_card_attachment'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('partnership/v1', '/card/(?P<card_id>\\d+)/attachments', [
            'methods' => 'GET',
            'callback' => [$this, 'get_card_attachments'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
	}

    
    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        // Contract main table (like a project board)
        $sql_contract_table = "CREATE TABLE IF NOT EXISTS {$this->contract_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            invoice_item_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE(invoice_item_id)
        ) $charset_collate;";

        // Columns on the board (like Trello columns)
        $sql_column_table = "CREATE TABLE IF NOT EXISTS {$this->column_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            contract_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            sort_order INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY contract_id (contract_id)
        ) $charset_collate;";

        // Cards inside columns
        $sql_card_table = "CREATE TABLE IF NOT EXISTS {$this->card_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            column_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            sort_order INT DEFAULT 0,
            due_date DATETIME DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY column_id (column_id)
        ) $charset_collate;";

        // Checklist items on each card
        $sql_checklist_table = "CREATE TABLE IF NOT EXISTS {$this->checklist_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            card_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            is_completed BOOLEAN DEFAULT FALSE,
            sort_order INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY card_id (card_id)
        ) $charset_collate;";

        // Comments or discussions on a card
        $sql_comment_table = "CREATE TABLE IF NOT EXISTS {$this->comment_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            card_id BIGINT NOT NULL,
            user_id BIGINT NOT NULL,
            comment TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY card_id (card_id),
            KEY user_id (user_id)
        ) $charset_collate;";

        // Attachments on a card
        $sql_attachment_table = "CREATE TABLE IF NOT EXISTS {$this->attachment_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            card_id BIGINT NOT NULL,
            file_url TEXT NOT NULL,
            uploaded_by BIGINT NOT NULL,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY card_id (card_id),
            KEY uploaded_by (uploaded_by)
        ) $charset_collate;";


        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql_contract_table);
        dbDelta($sql_column_table);
        dbDelta($sql_card_table);
        dbDelta($sql_checklist_table);
        dbDelta($sql_comment_table);
        dbDelta($sql_attachment_table);

    }

    public function register_deactivation_hook() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$this->contract_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->column_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->card_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->checklist_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->comment_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->attachment_table}");
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
        $store = (int) $request->get_param('store');
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
                    'total' => (float) $price,
                    'items' => [
                        ['type' => 'package', 'label' => null, 'price' => 0, 'identifier' => $package_id . '->' . $package_plan, 'store' => $store],
                    ],
                    'customer' => [
                        'first_name' => $request->get_param('first_name'),
                        'middle_name' => $request->get_param('middle_name'),
                        'last_name' => $request->get_param('last_name'),
                        'phone' => [
                            'countryCode' => $request->get_param('countryCode'),
                            'number' => $request->get_param('client_phone')
                        ]
                    ],
                    'metadata' => [
                        'first_name' => $request->get_param('first_name'),
                        'middle_name' => $request->get_param('middle_name'),
                        'last_name' => $request->get_param('last_name'),
                        'phone' => $request->get_param('client_phone'),
                        'phone_code' => $request->get_param('countryCode')
                    ]
                ];
                $invoice_id = Invoice::get_instance()->create_invoice($payload);
                $response = Invoice::get_instance()->get_invoice($invoice_id);
                return rest_ensure_response($response);
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
                'list_title' => "What's included",
                'icon' => '',
                'list' => [
                    'Social Media Ads Management (1 platform)',
                    'Google Ads Management',
                    'All Conversion Setup',
                    'All Pixel Setup',
                    '5 Post Design / 2 Motion Video',
                    // 'Whatsapp Marketing',
                    // 'Email Marketing',
                    // 'SEO'
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
                'list_title' => "What's included",
                'icon' => '',
                'list' => [
                    'Social Media Ads Management (1 platform)',
                    'Google Ads Management',
                    'All Conversion Setup',
                    'All Pixel Setup',
                    '10 Post Design / 4 Motion Graphics',
                    'Whatsapp marketing',
                    // 'Email Marketing',
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
                'list_title' => "What's included",
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
                'list_title' => "What's included",
                'icon' => '',
                'list' => [
                    'Custom setup, account provisioning, and dedicated support for complex needs.'
                ],
                'pricing' => []
            ],
        ];
    }


    public function invoice_paid($def, $invoice, $_db_updated) {
        if (! $_db_updated) {return $def;}
        if (! isset($invoice['id'])) {return $def;}
        $user_id = Invoice::get_instance()->get_invoice_meta($invoice['id'], 'author_id');
        if (empty($user_id)) {return $def;}
        $user = get_user_by('id', $user_id);
        // 
    }


    private function create_contract($args) {
        global $wpdb;
        $_inserted = $wpdb->insert(
            $this->contract_table,
            [
                'invoice_item_id' => $data['invoice_item_id'] ?? '',
                'title' => $data['title'] ?? '',
                'description' => $data['description'] ?? ''
            ],
            ['%d', '%s', '%s']
        );
        return $_inserted ? $this->get_contract($wpdb->insert_id) : new WP_Error('failed_create_contract', sprintf('Failed to create contract.\nError: %s', $wpdb->last_error), ['status' => 500]);
    }

    private function get_contract($contract_id, $row_only = true) {
        global $wpdb;
        
        $contract = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->contract_table} WHERE id = %d", $contract_id),
            ARRAY_A
        );
        
        if (!$contract) {
            return new WP_Error('contract_not_found', 'Contract not found.', ['status' => 404]);
        }
        
        $response = ['contract' => $contract];
        
        if (! $row_only) {

            $columns = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$this->column_table} WHERE contract_id = %d ORDER BY sort_order ASC", $contract_id),
                ARRAY_A
            );

            foreach ($columns as $index => $column) {
                $cards = $wpdb->get_results(
                    $wpdb->prepare("SELECT * FROM {$this->card_table} WHERE column_id = %d ORDER BY sort_order ASC", $column['id']),
                    ARRAY_A
                );

                foreach ($cards as &$card) {
                    $card['checklists'] = $wpdb->get_results(
                        $wpdb->prepare("SELECT * FROM {$this->checklist_table} WHERE card_id = %d ORDER BY sort_order ASC", $card['id']),
                        ARRAY_A
                    );

                    $card['comments'] = $wpdb->get_results(
                        $wpdb->prepare("SELECT * FROM {$this->comment_table} WHERE card_id = %d ORDER BY created_at ASC", $card['id']),
                        ARRAY_A
                    );

                    $card['attachments'] = $wpdb->get_results(
                        $wpdb->prepare("SELECT * FROM {$this->attachment_table} WHERE card_id = %d ORDER BY created_at ASC", $card['id']),
                        ARRAY_A
                    );
                }

                $columns[$index]['cards'] = $cards;
            }

            $response['columns'] = $columns;
        }
        return $response;

    }


    // contract or project board api function starts here
    public function get_api_contracts(WP_REST_Request $request) {
        global $wpdb;
        $user_id = Security::get_instance()->user_id;
        // 
        $deals = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$this->contract_table}"),
            ARRAY_A
        );
        foreach ($deals as $index => $deal) {
            $deals[$index]['invoice_item'] = Invoice::get_instance()->get_invoice_by_item_id($deal['invoice_item_id']);
        }
        $response = $deals;
        return rest_ensure_response($response);
    }


    public function get_api_contract(WP_REST_Request $request) {
        $contract_id = (int) $request->get_param('contract_id');
        $user_id = Security::get_instance()->user_id;

        $response = $this->get_contract($contract_id, false);

        return rest_ensure_response($response);
    }


    public function api_create_contract(WP_REST_Request $request) {
        $data = $request->get_json_params();
        $response = $this->create_contract($data);
        return rest_ensure_response($response);
    }

    public function get_contract_columns(WP_REST_Request $request) {
        $contract_id = (int) $request->get_param('contract_id');
        $response = []; // Fetch columns
        return rest_ensure_response($response);
    }

    public function create_column(WP_REST_Request $request) {
        $contract_id = (int) $request->get_param('contract_id');
        $data = $request->get_json_params();
        $response = []; // Insert column
        return rest_ensure_response($response);
    }

    public function get_column_cards(WP_REST_Request $request) {
        $column_id = (int) $request->get_param('column_id');
        $response = []; // Get cards under column
        return rest_ensure_response($response);
    }

    public function create_card(WP_REST_Request $request) {
        $column_id = (int) $request->get_param('column_id');
        $data = $request->get_json_params();
        $response = []; // Create new card
        return rest_ensure_response($response);
    }

    public function get_card_detail(WP_REST_Request $request) {
        $card_id = (int) $request->get_param('card_id');
        $response = []; // Fetch card detail
        return rest_ensure_response($response);
    }

    public function create_checklist_item(WP_REST_Request $request) {
        $card_id = (int) $request->get_param('card_id');
        $data = $request->get_json_params();
        $response = []; // Insert checklist item
        return rest_ensure_response($response);
    }

    public function get_card_checklists(WP_REST_Request $request) {
        $card_id = (int) $request->get_param('card_id');
        $response = []; // Get checklist items
        return rest_ensure_response($response);
    }

    public function add_card_comment(WP_REST_Request $request) {
        $card_id = (int) $request->get_param('card_id');
        $data = $request->get_json_params();
        $response = []; // Insert comment
        return rest_ensure_response($response);
    }

    public function get_card_comments(WP_REST_Request $request) {
        $card_id = (int) $request->get_param('card_id');
        $response = []; // Fetch comments
        return rest_ensure_response($response);
    }

    public function upload_card_attachment(WP_REST_Request $request) {
        $card_id = (int) $request->get_param('card_id');
        $response = []; // Handle file upload and attach
        return rest_ensure_response($response);
    }

    public function get_card_attachments(WP_REST_Request $request) {
        $card_id = (int) $request->get_param('card_id');
        $response = []; // Get attachment list
        return rest_ensure_response($response);
    }

    
}
