<?php
/**
 * Payment Invoice Template
 *
 * This file is loaded when visiting /pricing/
 */
get_header();
?>

<div
    id="payment-pricing"
></div>

<?php
wp_enqueue_script('wp-partnershipm-pricing');
get_footer();
