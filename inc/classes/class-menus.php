<?php
/**
 * Register Menus
 *
 * @package PartnershipManager
 */
namespace PARTNERSHIP_MANAGER\inc;
use PARTNERSHIP_MANAGER\inc\Traits\Singleton;
class Menus {
	use Singleton;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_filter('pm_project/settings/general', [$this, 'general'], 10, 1);
		add_filter('pm_project/settings/fields', [$this, 'menus'], 10, 1);
	}
	/**
	 * WordPress Option page.
	 * 
	 * @return array
	 */
	public function general($args) {
		return [
			...$args,
			'page_title'					=> __('Partnership dashboard Settings', 'wp-partnershipm'),
			'menu_title'					=> __('Dashboard', 'wp-partnershipm'),
			'page_header'					=> __('Partnership dashboard application in depth configuration screen.', 'wp-partnershipm'),
			'page_subheader'				=> __("Place to setup your partnership program deshboard with application configurations and stuffs. Don't touch anything if you're not sure enough on this. Carefully change, update or delete anything because it may required some data to matched same stage and it does't save any revissions.", 'wp-partnershipm'),
		];
	}
	public function menus($args) {
		// apply_filters('pm_project/system/isactive', 'general-paused')
		// apply_filters('pm_project/system/getoption', 'general-paused', false)
		$args['general']		= [
			'title'							=> __('General', 'wp-partnershipm'),
			'description'					=> __('General settings for teddy-bear customization popup.', 'wp-partnershipm'),
			'fields'						=> [
				[
					'id' 					=> 'general-paused',
					'label'					=> __('Pause', 'wp-partnershipm'),
					'description'			=> __('Mark to pause the application unconditionally.', 'wp-partnershipm'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'general-screen',
					'label'					=> __('dashboard screen', 'wp-partnershipm'),
					'description'			=> __("Select a dashboard screen from where we'll apply the dashboard interface", 'wp-partnershipm'),
					'type'					=> 'select',
					'options'				=> $this->get_query(['post_type' => 'page', 'post_status' => 'any', 'type' => 'option', 'limit' => 50]),
					'default'				=> false
				],
				[
					'id' 					=> 'general-policy',
					'label'					=> __('Privacy policy', 'wp-partnershipm'),
					'description'			=> __("Select a privacy policy page.", 'wp-partnershipm'),
					'type'					=> 'select',
					'options'				=> $this->get_query(['post_type' => 'page', 'post_status' => 'any', 'type' => 'option', 'limit' => 50]),
					'default'				=> false
				],
				[
					'id' 					=> 'general-terms',
					'label'					=> __('Terms & Condition', 'wp-partnershipm'),
					'description'			=> __("Select a term and condition page", 'wp-partnershipm'),
					'type'					=> 'select',
					'options'				=> $this->get_query(['post_type' => 'page', 'post_status' => 'any', 'type' => 'option', 'limit' => 50]),
					'default'				=> false
				],
			]
		];
		$args['payment']		= [
			'title'							=> __('Payment', 'wp-partnershipm'),
			'description'					=> __('Payment configurations, gateway setups and all necessery things will be done form here.', 'wp-partnershipm'),
			'fields'						=> [
				[
					'id' 					=> 'payment-paused',
					'label'					=> __('Pause', 'wp-partnershipm'),
					'description'			=> __('Mark to pause the application unconditionally.', 'wp-partnershipm'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'payment-tap-secretkey',
					'label'					=> __('Secret key', 'wp-partnershipm'),
					'description'			=> __('Provide tap secret key.', 'wp-partnershipm'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 					=> 'payment-tap-publickey',
					'label'					=> __('Public key', 'wp-partnershipm'),
					'description'			=> __('Provide tap public key.', 'wp-partnershipm'),
					'type'					=> 'text',
					'default'				=> ''
				],


				[
					'id' 					=> 'payment-invoice-bg',
					'label'					=> __('Invoice background', 'wp-partnershipm'),
					'description'			=> __('Provide here an image url that will work as an background image of anonymouse payment background.', 'wp-partnershipm'),
					'type'					=> 'url',
					'default'				=> ''
				],

			]
		];
		$args['checkout']		= [
			'title'							=> __('Checkout', 'wp-partnershipm'),
			'description'					=> __('Checkout configurations, fields customization. Things enables and disables.', 'wp-partnershipm'),
			'fields'						=> [
				[
					'id' 					=> 'checkout-default-phonecode',
					'label'					=> __('Default Country', 'wp-partnershipm'),
					'description'			=> __('Put a default country code for phone number.', 'wp-partnershipm'),
					'type'					=> 'text',
					'default'				=> 'ae'
				],
				[
					'id' 					=> 'checkout-enable-middlename',
					'label'					=> __('Middle name', 'wp-partnershipm'),
					'description'			=> __('Mark to enable client middle name on checkout field.', 'wp-partnershipm'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'checkout-enable-emirate',
					'label'					=> __('Emirate', 'wp-partnershipm'),
					'description'			=> __('Mark to enable select Emirate on checkout after address.', 'wp-partnershipm'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'checkout-enable-overview',
					'label'					=> __('Cart overview', 'wp-partnershipm'),
					'description'			=> __('Mark to enable order line items or overview on the checkout screen right after the checkout field.', 'wp-partnershipm'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
			]
		];

		return $args;
	}
	public function get_query($args) {
		global $teddy_Plushies;
		$args = (object) wp_parse_args($args, [
			'post_type'		=> 'product',
			'type'			=> 'option',
			'limit'			=> 500,
			'queryType'		=> 'post',
			'noaccessory'	=> false,
			'post_status'	=> 'publish'
		]);
		$options = [];
		if($args->queryType == 'post') {
			$query = get_posts([
				'numberposts'		=> $args->limit,
				'post_type'			=> $args->post_type,
				'order'				=> 'DESC',
				'orderby'			=> 'date',
				'post_status'		=> $args->post_status
				
			]);
			foreach($query as $_post) {
				if($args->noaccessory && $teddy_Plushies->is_accessory($_post->ID)) {continue;}
				$options[$_post->ID] = get_the_title($_post->ID);

				// Function to remove popup customization meta.
				// _product_custom_popup || _teddy_custom_data
				// $meta = get_post_meta($_post->ID, '_product_custom_popup', true);
				// $exists = get_post_meta($_post->ID, '_product_custom_popup_stagged', true);
				// if(! $meta && $exists) {
				// 	update_post_meta($_post->ID, '_product_custom_popup', $exists);
				// 	$updated = delete_post_meta($_post->ID, '_product_custom_popup_stagged');
				// 	if(!$updated) {echo 'post meta failed to removed';}
				// }
				
			}
		} else if($args->queryType == 'term') {
			$query = get_categories('taxonomy=product_cat&post_type=product');
			foreach($query as $_post) {
				$options[$_post->cat_ID] = $_post->cat_name;
			}
		} else {}
		return $options;
	}
}

/**
 * {{client_name}}, {{client_address}}, {{todays_date}}, {{retainer_amount}}
 */
