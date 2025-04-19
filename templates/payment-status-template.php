<?php
$status = get_query_var('protools_payment_status') ?? 'unknown';
// 
if ($status == 'success') {
    $verify = apply_filters('partnersmanagerpayment/verify', $status, $_POST);
    if ($verify) {
        do_action('partnersmanagerpayment/done', $status, $_POST);
    }
}
// get the header
get_header();

// echo '<pre>';print_r($_POST);echo '</pre>';

// switch the status
switch ($status) {
    case 'success':
        $message = [
            'status' => 'success',
            'title' => 'Payment Successful',
            'message' => 'Your payment has been successfully processed. Thank you for your purchase.',
            'button' => 'Launch Tools',
            'icon' => 'fa-check-circle',
        ];
        break;
    case 'cancel':
        $message = [
            'status' => 'cancel',
            'title' => 'Payment Cancelled',
            'message' => 'Your transaction has been cancelled. You can try again or contact our support team for assistance.',
            'button' => 'Try Again',
            'icon' => 'fa-times-circle',
        ];
        break;
    case 'fail':
        $message = [
            'status' => 'fail',
            'title' => 'Payment Failed',
            'message' => 'Sorry, your payment failed. Please try again or contact our support team for assistance.',
            'button' => 'Try Again',
            'icon' => 'fa-exclamation-circle',
        ];
        break;
    default:
        $message = [
            'status' => 'unknown',
            'title' => 'Unknown Payment Status',
            'message' => 'We\'re sorry, but we\'re unable to determine the status of your payment. Please contact our support team for assistance.',
            'button' => 'Contact Support',
            'icon' => 'fa-question-circle',
        ];
        break;
}

?>
<div class="payment-status <?php echo esc_attr($message['status']); ?>">
    <h2><i class="fa <?php echo esc_attr($message['icon']); ?>"></i> <?php echo esc_html($message['title']); ?></h2>
    <p><?php echo esc_html($message['message']); ?></p>
    <button class="btn btn-primary" data-protools-payment-object="<?php echo esc_attr(
        base64_encode(json_encode($_POST))
        // array_slice(base64_encode(json_encode($_POST)), 0, -1)
    ); ?>"><?php echo esc_html($message['button']); ?></button>
</div>
<?php
// get the footer
get_footer();
?>
<style>
.payment-status {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>