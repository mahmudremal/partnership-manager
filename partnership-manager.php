<?php
/**
 * This plugin made for Ecommerized Partnership program.
 *
 * @wordpress-plugin
 * Plugin Name:       Partnership Manager
 * Plugin URI:        https://github.com/mahmudremal/
 * Description:       Partnership Manager ecommerized partnership dashboard.
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            Ecommerized
 * Author URI:        https://github.com/mahmudremal/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wp-partnershipm
 * Domain Path:       /languages
 * 
 * @package PartnershipManager
 * @author  Remal Mahmud (https://github.com/mahmudremal/)
 * @version 1.0.2
 * @link https://github.com/mahmudremal/wp-partnership-manager/
 * @category	WooComerce Plugin
 * @copyright	Copyright (c) 2023-25
 * 
 */


defined('WP_PARTNERSHIPM__FILE__') || define('WP_PARTNERSHIPM__FILE__', untrailingslashit(__FILE__));
defined('WP_PARTNERSHIPM_DIR_PATH') || define('WP_PARTNERSHIPM_DIR_PATH', untrailingslashit(plugin_dir_path(WP_PARTNERSHIPM__FILE__)));
defined('WP_PARTNERSHIPM_DIR_URI') || define('WP_PARTNERSHIPM_DIR_URI', untrailingslashit(plugin_dir_url(WP_PARTNERSHIPM__FILE__)));
defined('WP_PARTNERSHIPM_BUILD_URI') || define('WP_PARTNERSHIPM_BUILD_URI', untrailingslashit(WP_PARTNERSHIPM_DIR_URI) . '/dist');
defined('WP_PARTNERSHIPM_BUILD_PATH') || define('WP_PARTNERSHIPM_BUILD_PATH', untrailingslashit(WP_PARTNERSHIPM_DIR_PATH) . '/dist');
defined('WP_PARTNERSHIPM_BUILD_JS_URI') || define('WP_PARTNERSHIPM_BUILD_JS_URI', untrailingslashit(WP_PARTNERSHIPM_DIR_URI) . '/dist/js');
defined('WP_PARTNERSHIPM_BUILD_JS_DIR_PATH') || define('WP_PARTNERSHIPM_BUILD_JS_DIR_PATH', untrailingslashit(WP_PARTNERSHIPM_DIR_PATH) . '/dist/js');
defined('WP_PARTNERSHIPM_BUILD_IMG_URI') || define('WP_PARTNERSHIPM_BUILD_IMG_URI', untrailingslashit(WP_PARTNERSHIPM_DIR_URI) . '/dist/src/img');
defined('WP_PARTNERSHIPM_BUILD_CSS_URI') || define('WP_PARTNERSHIPM_BUILD_CSS_URI', untrailingslashit(WP_PARTNERSHIPM_DIR_URI) . '/dist/css');
defined('WP_PARTNERSHIPM_BUILD_CSS_DIR_PATH') || define('WP_PARTNERSHIPM_BUILD_CSS_DIR_PATH', untrailingslashit(WP_PARTNERSHIPM_DIR_PATH) . '/dist/css');
defined('WP_PARTNERSHIPM_BUILD_LIB_URI') || define('WP_PARTNERSHIPM_BUILD_LIB_URI', untrailingslashit(WP_PARTNERSHIPM_DIR_URI) . '/dist/library');
defined('WP_PARTNERSHIPM_ARCHIVE_POST_PER_PAGE') || define('WP_PARTNERSHIPM_ARCHIVE_POST_PER_PAGE', 9);
defined('WP_PARTNERSHIPM_SEARCH_RESULTS_POST_PER_PAGE') || define('WP_PARTNERSHIPM_SEARCH_RESULTS_POST_PER_PAGE', 9);
defined('WP_PARTNERSHIPM_OPTIONS') || define('WP_PARTNERSHIPM_OPTIONS', get_option('wp-partnershipm'));
// 
// 
// 
require_once WP_PARTNERSHIPM_DIR_PATH . '/inc/helpers/autoloader.php';
require_once WP_PARTNERSHIPM_DIR_PATH . '/inc/helpers/template-tags.php';
try {
	// add_action('wp_enqueue_scripts', 'enqueue_all_chunks_except_specific');
	\PARTNERSHIP_MANAGER\inc\Project::get_instance();
} catch (\Throwable $th) {
	//throw $th;
} catch (\WP_Error $th) {
	//throw $th;
} catch (Error $th) {
	//throw $th;
}


function enqueue_all_chunks_except_specific() {
    $dist_dir = plugin_dir_path(__FILE__) . 'dist/js/';
    $exclude_files = ['pwa.js', 'public.js', 'admin.js', 'runtime.js', 'task.js'];

    // Get all .js files in the dist/js directory
    $js_files = glob($dist_dir . '*.js');
    
    // Loop through each file and enqueue them
    foreach ($js_files as $file) {
        $file_name = basename($file);

        // Skip files that are in the exclude list
        if (in_array($file_name, $exclude_files)) {
            continue;
        }
        wp_enqueue_script(
            $file_name,
            plugin_dir_url(__FILE__) . 'dist/js/' . $file_name,
            ['wp-partnershipm-runtime'],
            null,
            true
        );
    }
}

