<?php
namespace PARTNERSHIP_MANAGER\inc;

use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Invoice {
    use Singleton;

    protected $invoice_table;
    protected $item_table;

    protected function __construct() {
        global $wpdb;
        $this->invoice_table = $wpdb->prefix . 'partnership_invoices';
        $this->item_table = $wpdb->prefix . 'partnership_invoice_items';
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        register_activation_hook(WP_PARTNERSHIPM__FILE__, [$this, 'register_activation_hook']);
        add_action('init', [$this, 'add_custom_rewrite']);
        add_action('template_redirect', [$this, 'handle_invoice_payment_template']);
		add_action('rest_api_init', [$this, 'register_routes']);
    }
	public function register_routes() {
		register_rest_route('partnership/v1', '/invoice/create', [
			'methods' => 'POST',
			'callback' => [$this, 'api_create_invoice'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/invoice/list', [
			'methods' => 'GET',
			'callback' => [$this, 'api_list_invoice'],
            'args'     => [
                'page'     => [
                    'default'           => 1,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function ($v) {return is_numeric($v);},
                    'description'       => __('Page number.', 'wp-partnershipm')
                ],
                's'        => [
                    'default'           => '',
                    'sanitize_callback' => 'sanitize_text_field',
                    'description'       => __('Search keyword.', 'wp-partnershipm')
                ],
                'status'   => [
                    'default'           => '',
                    'sanitize_callback' => 'sanitize_text_field',
                    'description'       => __('User status (e.g., pending, approved).', 'wp-partnershipm')
                ],
                'per_page' => [
                    'default'           => 10,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function ($v) {return is_numeric($v);},
                    'description'       => __('Number of users per page.', 'wp-partnershipm')
                ]
            ],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/invoice/(?P<invoice_id>[^/]+)', [
			'methods' => 'GET',
			'callback' => [$this, 'api_get_invoice'],
			// 'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('partnership/v1', '/invoice/(?P<invoice_id>[^/]+)/pay', [
			'methods' => 'POST',
			'callback' => [$this, 'api_pay_invoice'],
			// 'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
	}

    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $sql_invoice = "CREATE TABLE {$this->invoice_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            invoice_id VARCHAR(100) NOT NULL,
            status VARCHAR(50) DEFAULT 'unpaid',
            client_email VARCHAR(100),
            currency VARCHAR(50) DEFAULT 'USD',
            total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE(invoice_id)
        ) $charset_collate;";

        $sql_items = "CREATE TABLE {$this->item_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            invoice_id BIGINT NOT NULL,
            label VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
            PRIMARY KEY (id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql_invoice);
        dbDelta($sql_items);

        flush_rewrite_rules();
    }

    public function add_custom_rewrite() {
        add_rewrite_rule('^invoice/([^/]+)/pay/?$', 'index.php?custom_invoice_id=$matches[1]', 'top');
        add_rewrite_tag('%custom_invoice_id%', '([^&]+)');
    }

    public function handle_invoice_payment_template() {
        $invoice_id = get_query_var('custom_invoice_id');
        if ($invoice_id) {
            include WP_PARTNERSHIPM_DIR_PATH . '/templates/payment-invoice.php';
            exit;
        }
    }
    
    public function api_list_invoice(WP_REST_Request $request) {
        global $wpdb;
        $page     = absint($request->get_param('page')) ?: 1;
        $search   = sanitize_text_field($request->get_param('s'));
        $status   = sanitize_text_field($request->get_param('status'));
        $per_page = absint($request->get_param('per_page')) ?: 10;
        $offset   = ($page - 1) * $per_page;
    
        $table_name = $this->invoice_table;
        $where      = 'WHERE 1=1';
        $search_query = '';
    
        if (!empty($search)) {
            $search_term   = '%' . $wpdb->esc_like($search) . '%';
            $search_query  .= $wpdb->prepare(' AND (invoice_id LIKE %s OR client_email LIKE %s)', $search_term, $search_term);
        }
    
        if (!empty($status) && $status !== 'any') {
            $where .= $wpdb->prepare(' AND status = %s', $status);
        }
    
        $query = $wpdb->prepare("
            SELECT *
            FROM {$table_name}
            {$where}
            {$search_query}
            ORDER BY created_at DESC
            LIMIT %d OFFSET %d
        ", $per_page, $offset);
    
        $invoices = $wpdb->get_results($query);
    
        $total_query = "
            SELECT COUNT(id)
            FROM {$table_name}
            {$where}
            {$search_query}
        ";
        $total_invoices = $wpdb->get_var($total_query);
        $max_pages      = ceil($total_invoices / $per_page);
    
        foreach ($invoices as $index => $invoice) {
            $invoices[$index]->created_at = strtotime($invoices[$index]->created_at);
            // $invoices[$index]->updated_at = strtotime($invoices[$index]->updated_at);
        }
        
        $response_data = $invoices;
    
        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', (int) $total_invoices);
        $response->header('X-WP-TotalPages', (int) $max_pages);
    
        return $response;
    }
	public function api_create_invoice(WP_REST_Request $request) {
        $invoice_id = $request->get_param('invoice_id');
        
        $payload = [
            'invoice_id' => $invoice_id,
            'currency' => $request->get_param('currency'),
            'client_email' => $request->get_param('client_email'),
            'total' => $request->get_param('total'),
            'items' => (array) $request->get_param('items'),
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
        // $_updated = $this->create_invoice($payload);
        // 
        // $response = $this->get_invoice($invoice_id);
        // 
		return rest_ensure_response($_POST);
	}
	public function api_get_invoice(WP_REST_Request $request) {
		$invoice_id = $request->get_param('invoice_id');
        // 
        $response = $this->get_invoice($invoice_id);
        // 
		return rest_ensure_response($response);
	}
	public function api_pay_invoice(WP_REST_Request $request) {
		$invoice_id = $request->get_param('invoice_id');
		$card_token = $request->get_param('cardToken');
        // 
        $invoice = $this->get_invoice($invoice_id);

        $metadata = [];
        foreach ($invoice['items'] as $index => $item) {
            $metadata[$item['label']] = $item['price'];
        }
        
        $payload = [
            'amount'            => (float) $invoice['total'],
            'currency'          => $invoice['currency'],
            'save_card'         => true,
            'description'       => '',
            'metadata'          => $metadata,
            'reference'         => [
                'product_info' => $args['title'],
                'customer_id' => $args['user']['id'] ?? 0,
                'card_id'   => $card['id'],
                'invoice_id' => $invoice['invoice_id']
            ],
            'customer' => [
                'first_name' => $request->get_param('firstName'),
                'middle_name' => $request->get_param('middleName'),
                'last_name' => $request->get_param('lastName'),
                'email' => $request->get_param('email'),
                'phone' => [
                    'country_code' => $request->get_param('countryCode'),
                    'number' => $request->get_param('phone')
                ]
            ],
            'source'            => [
                'id' => $card_token
            ],
        ];
        $response = Payment::get_instance()->create_payment_intent($payload, $request->get_param('provider'));
        if (isset($response['transaction']) && isset($response['transaction']['url'])) {
            $response = [
                ...$response,
                'payment_url' => $response['transaction']['url']
            ];
        }
        // 
		return rest_ensure_response($response);
	}

    public function create_invoice($args) {
        global $wpdb;

        if (empty($args['invoice_id']) || $args['invoice_id'] == 0) {
            $args['invoice_id'] = wp_unique_id('inv');
        }
        $invoice_id = sanitize_title($args['invoice_id']);
        $client_email = sanitize_email($args['client_email'] ?? '');
        $items = $args['items'] ?? []; // array of ['label' => '', 'price' => 0]
        $total = array_sum(array_column($items, 'price'));

        $wpdb->insert($this->invoice_table, [
            'invoice_id' => $invoice_id,
            'client_email' => $client_email,
            'total' => $total,
            'status' => 'unpaid'
        ]);

        $invoice_db_id = $wpdb->insert_id;

        foreach ($items as $item) {
            $wpdb->insert($this->item_table, [
                'invoice_id' => $invoice_db_id,
                'label' => sanitize_text_field($item['label']),
                'price' => floatval($item['price'])
            ]);
        }

        return $invoice_id;
    }
    public function get_invoice($invoice_id) {
        global $wpdb;
        $invoice_id = sanitize_title($invoice_id);
        $invoice_query = $wpdb->prepare("SELECT * FROM {$this->invoice_table} WHERE invoice_id = %s", $invoice_id);
        $invoice_data = $wpdb->get_row($invoice_query, ARRAY_A);

        if (!$invoice_data) {
            return new WP_Error('no_invoice', __('Invoice not found', 'wp-partnershipm'));
        }
        $item_query = $wpdb->prepare("SELECT * FROM {$this->item_table} WHERE invoice_id = %d", $invoice_data['id']);
        $items = $wpdb->get_results($item_query, ARRAY_A);
        $invoice_data['items'] = $items;
        return $invoice_data;
    }
    public function mark_paid_invoice($invoice_id) {
        global $wpdb;
        $invoice_query = $wpdb->prepare("SELECT * FROM {} WHERE invoice_id = %s", $invoice_id);
        $_updated = $wpdb->update(
            $this->invoice_table,
            ['status' => 'paid'],
            ['invoice_id' => $invoice_id],
            ['%s'], ['%s']
        );
        return $_updated;
    }

}
