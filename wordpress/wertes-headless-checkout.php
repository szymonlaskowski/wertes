<?php
/**
 * Plugin Name: Wertes headless checkout
 * Description: Sends customers back to the Next.js shop after payment. Needs WERTES_FRONTEND_URL in wp-config.php, e.g. define( 'WERTES_FRONTEND_URL', 'https://wertes.pl' );
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'woocommerce_get_checkout_order_received_url', 'wertes_frontend_order_confirmation_url', 10, 2 );

function wertes_frontend_order_confirmation_url( $url, $order ) {
	if ( ! defined( 'WERTES_FRONTEND_URL' ) ) {
		return $url;
	}
	$query = http_build_query(
		array(
			'id'    => $order->get_id(),
			'key'   => $order->get_order_key(),
			'email' => $order->get_billing_email(),
		)
	);
	return untrailingslashit( WERTES_FRONTEND_URL ) . '/zamowienie/?' . $query;
}
