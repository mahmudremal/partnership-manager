<?php
/**
 * Rest API classes
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_Error;

class Frontend {
	use Singleton;

	protected function __construct() {
		$this->setup_hooks();
	}

    protected function setup_hooks() {
        add_action('query_vars', [$this, 'query_vars'], 10, 1);
        add_action('template_redirect', [$this, 'template_redirect'], 10, 0);
        add_action('after_switch_theme', [$this, 'after_switch_theme'], 10, 0);
        add_action('rewrite_rules_array', [$this, 'rewrite_rules_array'], 10, 1);
	}

    public function query_vars($query_vars) {
        $query_vars[] = 'mn_page';
        $query_vars[] = 'store_id';
        $query_vars[] = 'lead_id';
        
        return $query_vars;
    }

    public function rewrite_rules_array($rules) {
        $new_rules = [
            // 'partnership-dashboard/?$'          => 'index.php?mn_page=dashboard',
            // '^partnership-dashboard(.*)$'       => 'index.php?mn_page=dashboard',
            // '^signup(.*)$'       => 'index.php?mn_page=dashboard',
            // '^signin(.*)$'       => 'index.php?mn_page=dashboard',
            // '^forgot(.*)$'       => 'index.php?mn_page=dashboard',
            '^(partnership-dashboard|signup|signin|forgot)(.*)$' => 'index.php?mn_page=dashboard'
        ];
        return $new_rules + $rules;
    }

    public function template_redirect() {
        $page = get_query_var('mn_page');
        
        if ($page == 'dashboard') {
            include WP_PARTNERSHIPM_DIR_PATH . '/templates/dashboard/index.php';
            die;
        }
    }

    public function after_switch_theme() {
        flush_rewrite_rules();
    }

    
}