<?php
/**
 * Payment Invoice Template
 *
 * This file is loaded when visiting /invoice/[invoice-id]/pay
 */
get_header();
?>

<div
    id="payment-invoice"
    data-pbk="<?php echo esc_attr(apply_filters('pm_project/system/getoption', 'payment-tap-publickey', false)); ?>"
    data-bg="<?php echo esc_attr(apply_filters('pm_project/system/getoption', 'payment-invoice-bg', false)); ?>"
></div>


<style>#header, #footer {display: none;}</style>


<style>
#bookContainer {position: relative;width: 600px;height: 400px;overflow: hidden;perspective: 1000px;}
#rightPage {width: 50%;height: 100%;position: absolute;top: 0;right: 0;transform-origin: left center;transition: transform 0.7s ease-in-out, opacity 0.7s ease-in-out;}
.closed #rightPage {transform: rotateY(180deg);opacity: 0;}
</style>

<?php
wp_enqueue_script('wp-partnershipm-public');
get_footer();
