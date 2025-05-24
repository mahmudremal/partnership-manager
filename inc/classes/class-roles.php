<?php
/**
 * User Roles table class
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Response;
use WP_Error;
use WP_REST_Request;
use WP_User_Query;

class Roles {
	use Singleton;
    
    private $roles;
    
	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}

    protected function setup_hooks() {
        add_filter('init', [$this, 'register_custom_partnership_roles']);
        add_filter('admin_init', [$this, 'restrict_partnership_roles_admin_access']);
        add_action('after_setup_theme', [$this, 'disable_toolbar_for_partnership_roles']);
    }

    
    public function get_roles() {
        if ( ! $this->roles ) {
            $this->roles = [
                'partnership_project_manager' => [
                    'label' => __('Partnership Project Manager', 'partnership-manager'),
                    'capabilities' => [
                        'all_access' => true,
                    ],
                    
                ],
                'partnership_stuff'          => [
                    'label' => __('Partnership Stuff', 'partnership-manager'),
                    'capabilities' => [
                        'read' => true,
                        'payouts' => true,
                        'referral' => true,
                        'invoices' => false,
                        'packages' => true,
                        'contracts' => false,
                        'support-ticket' => true,
                    ],
                ],
                'partnership_influencer'     => [
                    'label' => __('Partnership Influencer', 'partnership-manager'),
                    'capabilities' => [
                        'read' => true,
                        'payouts' => true,
                        'referral' => true,
                        'invoices' => false,
                        'packages' => true,
                        'contracts' => false,
                        'support-ticket' => true,
                    ],
                ],
                'partnership_partner'        => [
                    'label' => __('Partnership Partner', 'partnership-manager'),
                    'capabilities' => [
                        'read' => true,
                        'users' => true,
                        'payouts' => true,
                        'referral' => true,
                        'invoices' => false,
                        'packages' => true,
                        'contracts' => false,
                        'partner-docs' => true,
                        'support-ticket' => true,
                    ],
                ],
                'partnership_client'         => [
                    'label' => __('Partnership Client', 'partnership-manager'),
                    'capabilities' => [
                        'read' => true,
                        'team' => true,
                        'stores' => true,
                        'payouts' => false,
                        'referral' => true,
                        'invoices' => true,
                        'packages' => true,
                        'contracts' => true,
                        'service-docs' => true,
                        'support-ticket' => true,
                    ],
                ],
            ];
        }
        return $this->roles;
    }
    
    public function register_custom_partnership_roles() {
        $roles = $this->get_roles();
        // 
        foreach ($roles as $role_key => $role) {
            add_role($role_key, $role['label'], $role['capabilities']);
        }
    }
    
    public function restrict_partnership_roles_admin_access() {
        if ( is_admin() && ! defined( 'DOING_AJAX' ) && is_user_logged_in() ) {
            $restricted_roles = array_keys($this->get_roles());
            // 
            $user = wp_get_current_user();
            // 
            foreach ( $restricted_roles as $role ) {
                if ( in_array( $role, (array) $user->roles, true ) ) {
                    wp_redirect( home_url() );
                    exit;
                }
            }
        }
    }
    public function disable_toolbar_for_partnership_roles() {
        if ( is_user_logged_in() ) {
            $restricted_roles = array_keys($this->get_roles());

            $user = wp_get_current_user();

            foreach ( $restricted_roles as $role ) {
                if ( in_array( $role, (array) $user->roles, true ) ) {
                    show_admin_bar( false );
                    return;
                }
            }
        }
    }

}