<?php
/**
 * Users table class
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
use WP_REST_Response;
use WP_Error;
use WP_REST_Request;
use WP_User_Query;

class Users {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}

    protected function setup_hooks() {
        add_filter('rest_api_init', [$this, 'rest_api_init']);
    }
    
    public function rest_api_init() {
        register_rest_route(
            'partnership/v1',
            '/users',
            array(
                'methods'  => 'GET',
                'callback' => [$this, 'partnership_get_users'],
                'args'     => array(
                    'page'     => array(
                        'default'           => 1,
                        'sanitize_callback' => 'absint',
                        'validate_callback' => function ($v) {return is_numeric($v);},
                        'description'       => __( 'Page number.', 'wp-partnershipm' ),
                    ),
                    's'        => array(
                        'default'           => '',
                        'sanitize_callback' => 'sanitize_text_field',
                        'description'       => __( 'Search keyword.', 'wp-partnershipm' ),
                    ),
                    'status'   => array(
                        'default'           => '',
                        'sanitize_callback' => 'sanitize_text_field',
                        'description'       => __( 'User status (e.g., pending, approved).', 'wp-partnershipm' ),
                    ),
                    'per_page' => array(
                        'default'           => 10,
                        'sanitize_callback' => 'absint',
                        'validate_callback' => function ($v) {return is_numeric($v);},
                        'description'       => __( 'Number of users per page.', 'wp-partnershipm' ),
                    ),
                ),
                'permission_callback' => [Security::get_instance(), 'permission_callback']
            )
        );
        register_rest_route(
            'partnership/v1',
            '/users/(?P<user_id>\d+)',
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'partnership_get_user_details'],
                'permission_callback' => [Security::get_instance(), 'permission_callback'],
                'args'                => [
                    'user_id' => [
                        'validate_callback' => function ($v) {return is_numeric($v);},
                        'sanitize_callback' => function ($v) {return absint($v);},
                        'required'          => true
                    ]
                ]
            ]
        );
    }
    
    public function partnership_get_users( WP_REST_Request $request ) {
        $page     = $request->get_param( 'page' );
        $search   = $request->get_param( 's' );
        $status   = $request->get_param( 'status' );
        $per_page = $request->get_param( 'per_page' );

        $args = array(
            'number'  => $per_page,
            'offset'  => ( $page - 1 ) * $per_page,
            'search'  => "*{$search}*",
            'fields'  => 'all',
            'orderby' => 'ID',
            'order'   => 'ASC',
        );

        if ( ! empty( $status ) && $status != 'any' ) {
            $args['meta_query'] = array(
                array(
                    'key'   => '_user_status',
                    'value' => $status,
                ),
            );
        }

        $user_query = new WP_User_Query( $args );
        $users      = $user_query->get_results();
        $total_users = $user_query->get_total();
        $max_pages   = ceil( $total_users / $per_page );

        $response_data = array();
        foreach ( $users as $user ) {
            $response_data[] = array(
                'id'         => $user->ID,
                'username'   => $user->user_login,
                'email'      => $user->user_email,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'meta'       => get_user_meta( $user->ID ),
                ...$this->prepare_user_data_for_response( $user )
            );
        }

        $response = rest_ensure_response( $response_data );
        $response->header( 'X-WP-Total', $total_users );
        $response->header( 'X-WP-TotalPages', $max_pages );

        return $response;
    }

    public function partnership_get_user_details( WP_REST_Request $request ) {
        $user_id = $request->get_param( 'user_id' );
    
        if ( ! $user_id ) {
            return new WP_Error( 'invalid_user_id', __( 'User ID is required.', 'your-text-domain' ), array( 'status' => 400 ) );
        }
    
        $user_data = get_userdata( $user_id );
    
        if ( ! $user_data ) {
            return new WP_Error( 'rest_user_invalid_id', __( 'Invalid user ID.', 'your-text-domain' ), array( 'status' => 404 ) );
        }
    
        return rest_ensure_response( $this->prepare_user_data_for_response( $user_data ) );
    }
    
    public static function prepare_user_data_for_response( $user ) {
        return [
            'id'          => $user->ID,
            'phone'       => '',
            'roles'       => $user->roles,
            'username'    => $user->user_login,
            'email'       => $user->user_email,
            'firstName'   => $user->first_name,
            'lastName'    => $user->last_name,
            'displayName' => $user->display_name,
            'avater'      => 'https://randomuser.me/api/portraits/men/' . $user->ID . '.jpg',
            'locale'      => get_user_meta($user->ID, 'partnership_dashboard_locale', true),
            ...(array) $user
        ];
    }

    public static function get_the_user_ip() {
        if ( ! empty( $_SERVER['HTTP_CLIENT_IP'] ) ) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return $ip;
    }

}