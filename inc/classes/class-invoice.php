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
    protected $meta_table;

    protected function __construct() {
        global $wpdb;
        $this->invoice_table = $wpdb->prefix . 'partnership_invoices';
        $this->item_table = $wpdb->prefix . 'partnership_invoice_items';
        $this->meta_table = $wpdb->prefix . 'partnership_invoice_meta';
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        register_activation_hook(WP_PARTNERSHIPM__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook( WP_PARTNERSHIPM__FILE__, [$this, 'register_deactivation_hook'] );
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

        $sql_invoice = "CREATE TABLE IF NOT EXISTS {$this->invoice_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            invoice_id VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'unpaid',
            client_email TEXT,
            currency VARCHAR(50) DEFAULT 'USD',
            total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE(invoice_id)
        ) $charset_collate;";

        $sql_items = "CREATE TABLE IF NOT EXISTS {$this->item_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            invoice_id TEXT NOT NULL,
            label VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
            type VARCHAR(255) NOT NULL DEFAULT 'custom',
            indentifier BIGINT NOT NULL DEFAULT 0,
            PRIMARY KEY (id)
        ) $charset_collate;";

        $sql_metas = "CREATE TABLE IF NOT EXISTS {$this->meta_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            invoice_id TEXT NOT NULL,
            meta_key VARCHAR(255) NOT NULL,
            meta_value TEXT NOT NULL DEFAULT '',
            PRIMARY KEY (id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql_invoice);
        dbDelta($sql_items);
        dbDelta($sql_metas);

    }

    public function register_deactivation_hook() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$this->invoice_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->item_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->meta_table}");
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
        
        $payload = [
            'invoice_id' => $request->get_param('invoice_id'),
            'currency' => $request->get_param('currency'),
            'client_email' => $request->get_param('client_email'),
            'total' => (float) $request->get_param('total'),
            'items' => (array) $request->get_param('items'),
            // 'customer' => [
            //     'first_name' => $request->get_param('first_name'),
            //     'middle_name' => $request->get_param('middle_name'),
            //     'last_name' => $request->get_param('last_name'),
            //     'phone' => [
            //         'countryCode' => $request->get_param('countryCode'),
            //         'number' => $request->get_param('client_phone')
            //     ]
            // ],
            'metadata' => (array) $request->get_param('metadata')
        ];
        
        $invoice_id = $this->create_invoice($payload);
        $response = is_wp_error($invoice_id) ? $invoice_id : $this->get_invoice($invoice_id);
		return rest_ensure_response($response);
	}
	public function api_get_invoice(WP_REST_Request $request) {
		$invoice_id = $request->get_param('invoice_id');
        // 
        $response = $this->get_invoice($invoice_id, true);
        // 
		return rest_ensure_response($response);
	}
	public function api_pay_invoice(WP_REST_Request $request) {
        global $wpdb;
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
            'description'       => 'N/A',
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
                    'country_code' => strtoupper($request->get_param('countryCode')),
                    'number' => $request->get_param('phone')
                ]
            ],
            'source'            => [
                'id' => $card_token
            ],
        ];
        $response = Payment::get_instance()->create_payment_intent($payload, $request->get_param('provider'));
        // 
        $customer = $response['customer'] ?? [];

        if (empty($invoice['client_email'])) {
            $_updated = $wpdb->update(
                $this->invoice_table,
                ['client_email' => $payload['customer']['email']],
                ['id' => $invoice['id']],
                ['%s'], ['%d']
            );
            if ($_updated) {
                $this->update_invoice_meta($invoice['id'], 'first_name', $payload['customer']['first_name']);
                $this->update_invoice_meta($invoice['id'], 'middle_name', $payload['customer']['middle_name']);
                $this->update_invoice_meta($invoice['id'], 'last_name', $payload['customer']['last_name']);
                
                $this->update_invoice_meta($invoice['id'], 'city', $request->get_param('city'));
                $this->update_invoice_meta($invoice['id'], 'address', $request->get_param('address'));
                $this->update_invoice_meta($invoice['id'], 'emirate', $request->get_param('emirate'));

                $this->update_invoice_meta($invoice['id'], 'phone', $payload['customer']['phone']['number']);
                $this->update_invoice_meta($invoice['id'], 'phone_code', $payload['customer']['phone']['country_code']);
            }
        }
        
        
        $_user_created = Referral::get_instance()->maybe_create_user([
            'email' => $customer['client_email'] ?? $customer['email'] ?? '',
            'first_name' => $customer['first_name'] ?? '',
            'last_name' => $customer['last_name'] ?? '',
            ...$payload['customer'],
            'meta_data' => [
                'converted' => true,
                'phone' => $customer['phone']['number'] ?? '',
                '_tap_customer_id' => $customer['id'] ?? null,
                'middle_name' => $customer['middle_name'] ?? '',
                'phone_code' => $customer['phone']['country_code'] ?? '',
            ]
        ]);
        if ($_user_created && !is_wp_error($_user_created) && is_int($_user_created)) {
            // $response['respective_user'] = $_user_created;
        }
        // 
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
        $invoice_id_raw = $args['invoice_id'] ?? '';
        $_invoice = empty($invoice_id_raw) ? null : $this->get_invoice($invoice_id_raw, false);
        if (is_wp_error($_invoice)) return $_invoice;
    
        if (!$_invoice && (empty($invoice_id_raw) || $invoice_id_raw == 0)) {
            $invoice_id_raw = uniqid('inv');
        }
    
        $invoice_id = sanitize_title($invoice_id_raw);
        $client_email = sanitize_email($args['client_email'] ?? '');
        $items = $args['items'] ?? [];
        $metadata = $args['metadata'] ?? [];
        $currency = $args['currency'] ?? 'USD';
        $total = array_sum(array_map(fn($item) => floatval($item['price'] ?? 0), $items));
    
        if ($_invoice) {
            $invoice_id = $_invoice['invoice_id'];
            $invoice_db_id = $_invoice['id'];
    
            $wpdb->update($this->invoice_table, [
                'client_email' => $client_email,
                'total' => $total,
                'status' => 'unpaid'
            ], ['invoice_id' => $invoice_id]);
    
            if ($wpdb->last_error) {
                return new WP_Error('db_update_error', __('Failed to update invoice.', 'domain'), ['status' => 500]);
            }
    
            $wpdb->delete($this->item_table, ['invoice_id' => $invoice_db_id], ['%d']);
        } else {
            $wpdb->insert($this->invoice_table, [
                'invoice_id' => $invoice_id,
                'currency' => $currency,
                'client_email' => $client_email,
                'total' => $total,
                'status' => 'unpaid'
            ]);
    
            if ($wpdb->last_error) {
                return new WP_Error('db_insert_error', __('Failed to create invoice.', 'domain'), ['status' => 500]);
            }
    
            $invoice_db_id = $wpdb->insert_id;
        }
    
        foreach ($items as $item) {
            $wpdb->insert($this->item_table, [
                'invoice_id' => $invoice_db_id,
                'label' => sanitize_text_field($item['label'] ?? ''),
                'price' => floatval($item['price'] ?? 0)
            ]);
        }
    
        foreach ($metadata as $meta_key => $meta_value) {
            $this->update_invoice_meta($invoice_db_id, $meta_key, $meta_value);
        }
    
        return $invoice_id;
    }
    
    public function get_invoice($invoice_id, $_with_meta = false) {
        global $wpdb;
        // $invoice_id = sanitize_title($invoice_id);
        $invoice_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->invoice_table} WHERE invoice_id = %s", $invoice_id), ARRAY_A);
        
        if (!$invoice_data) {
            return new WP_Error('no_invoice', __('Invoice not found', 'wp-partnershipm'));
        }

        $items = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$this->item_table} WHERE invoice_id = %d", $invoice_data['id']), ARRAY_A);
        $invoice_data['items'] = $items;

        if (isset($invoice_data['status']) && !in_array($invoice_data['status'], ['paid', 'cancelled'])) {
            $invoice_data['invoice_link'] = site_url(sprintf('/invoice/%s/pay/', $invoice_id));
        }

        if ($_with_meta) {
            $invoice_data['metadata'] = $this->get_invoice_meta($invoice_data['id']);
        }
        
        return $invoice_data;
    }
    public function mark_paid_invoice($invoice_id) {
        global $wpdb;
        $invoice = $this->get_invoice($invoice_id);
        $_updated = $wpdb->update(
            $this->invoice_table,
            ['status' => 'paid'],
            ['invoice_id' => $invoice_id],
            ['%s'], ['%s']
        );
        $user = get_user_by('email', $invoice['client_email']);
        if ($user) {
            $ref = $_COOKIE['ref'] ?? null;
            if ($ref && !empty($ref)) {
                $referrer_id = Referral::get_instance()->check_referral_code($ref);
                $post_id = do_action('create_referral_record', $referrer_id, $user->ID);
                update_post_meta($post_id, 'converted', true);
                Finance::get_instance()->add_transaction(
                    $referrer_id,
                    (float) $invoice['total'] * Referral::get_instance()->comission,
                    'credit',
                    $user->ID,
                    sprintf('Referral amount added to account. Referral user %s created a transection #%s with an amount of %f.', $user->display_name, $invoice_id, (float) $invoice['total'])
                );
            }
        }
        return $_updated;
    }

    public function update_invoice_meta($invoice_id, $meta_key, $meta_value) {
        global $wpdb;
        $invoice_id = (int) $invoice_id;
        $meta_key = sanitize_key($meta_key);
        $meta_value = wp_kses_post($meta_value);
    
        $existing_meta = $wpdb->get_var($wpdb->prepare(
            "SELECT meta_value FROM {$this->meta_table} WHERE invoice_id = %d AND meta_key = %s",
            $invoice_id, $meta_key
        ));
    
        if ($existing_meta !== null) {
            $result = $wpdb->update(
                $this->meta_table,
                ['meta_value' => $meta_value],
                ['invoice_id' => $invoice_id, 'meta_key' => $meta_key]
            );
        } else {
            $result = $wpdb->insert(
                $this->meta_table,
                [
                    'invoice_id' => $invoice_id,
                    'meta_key'   => $meta_key,
                    'meta_value' => $meta_value,
                ]
            );
        }
    
        return $result !== false;
    }

    public function get_invoice_meta($invoice_id, $meta_key = null) {
        global $wpdb;
        $invoice_id = (int) $invoice_id;
    
        if ($meta_key === null) {
            $metas = $wpdb->get_results($wpdb->prepare(
                "SELECT meta_key, meta_value FROM {$this->meta_table} WHERE invoice_id = %d",
                $invoice_id
            ), ARRAY_A);

            return array_reduce($metas, function($carry, $meta) {$carry[$meta['meta_key']] = $meta['meta_value'];return $carry;}, []);
            
            return $metas;
        } else {
            $meta_key = sanitize_key($meta_key);
            $meta_value = $wpdb->get_var($wpdb->prepare(
                "SELECT meta_value FROM {$this->meta_table} WHERE invoice_id = %d AND meta_key = %s",
                $invoice_id, $meta_key
            ));
            return $meta_value !== null ? $meta_value : null;
        }
    }

}
