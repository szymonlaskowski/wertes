<?php
/**
 * Plugin Name: Wertes headless checkout
 * Description: Sends customers back to the Next.js shop after payment and serves the customer account to it. Needs WERTES_FRONTEND_URL in wp-config.php, e.g. define( 'WERTES_FRONTEND_URL', 'https://wertes.pl' );
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const WERTES_ACCOUNT_COOKIE        = 'wertes_account';
const WERTES_ACCOUNT_TOKENS_META   = 'wertes_account_tokens';
const WERTES_ACCOUNT_LIFETIME_DAYS = 30;
const WERTES_PASSWORD_MIN_LENGTH   = 8;
const WERTES_ORDERS_SHOWN          = 50;
const WERTES_ADDRESS_FIELDS        = array( 'first_name', 'last_name', 'company', 'nip', 'phone', 'address_1', 'postcode', 'city' );
const WERTES_REQUIRED_FIELDS       = array( 'first_name', 'last_name', 'phone', 'address_1', 'postcode', 'city' );

add_filter( 'woocommerce_get_checkout_order_received_url', 'wertes_frontend_order_confirmation_url', 10, 2 );
add_filter( 'woocommerce_get_endpoint_url', 'wertes_frontend_password_reset_url', 10, 2 );
add_action( 'woocommerce_store_api_checkout_order_processed', 'wertes_assign_order_to_signed_in_customer' );
add_action( 'rest_api_init', 'wertes_register_account_routes' );

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

function wertes_frontend_password_reset_url( $url, $endpoint ) {
	if ( 'lost-password' !== $endpoint || ! defined( 'WERTES_FRONTEND_URL' ) ) {
		return $url;
	}
	return untrailingslashit( WERTES_FRONTEND_URL ) . '/konto/nowe-haslo/';
}

function wertes_assign_order_to_signed_in_customer( $order ) {
	$user_id = wertes_signed_in_user_id();
	if ( 0 === $user_id ) {
		return;
	}
	$order->set_customer_id( $user_id );
	$order->save();
}

function wertes_register_account_routes() {
	$routes = array(
		'/konto'                    => array( 'GET', 'wertes_show_account' ),
		'/konto/zamowienia'         => array( 'GET', 'wertes_list_orders' ),
		'/konto/adres'              => array( 'POST', 'wertes_save_address' ),
		'/konto/logowanie'          => array( 'POST', 'wertes_sign_in' ),
		'/konto/wylogowanie'        => array( 'POST', 'wertes_sign_out' ),
		'/konto/rejestracja'        => array( 'POST', 'wertes_register' ),
		'/konto/haslo/przypomnienie' => array( 'POST', 'wertes_send_password_reset' ),
		'/konto/haslo/nowe'         => array( 'POST', 'wertes_set_new_password' ),
	);
	foreach ( $routes as $path => list( $method, $callback ) ) {
		register_rest_route(
			'wertes/v1',
			$path,
			array(
				'methods'             => $method,
				'callback'            => $callback,
				'permission_callback' => '__return_true',
			)
		);
	}
}

function wertes_show_account() {
	$user_id = wertes_signed_in_user_id();
	if ( 0 === $user_id ) {
		return wertes_signed_out_error();
	}
	return wertes_private_response( wertes_account_of( $user_id ) );
}

function wertes_list_orders() {
	$user_id = wertes_signed_in_user_id();
	if ( 0 === $user_id ) {
		return wertes_signed_out_error();
	}
	$orders = wc_get_orders(
		array(
			'customer_id' => $user_id,
			'limit'       => WERTES_ORDERS_SHOWN,
			'orderby'     => 'date',
			'order'       => 'DESC',
		)
	);
	$summaries = array();
	foreach ( $orders as $order ) {
		$summaries[] = array(
			'id'     => $order->get_id(),
			'number' => $order->get_order_number(),
			'date'   => $order->get_date_created()->date( 'c' ),
			'status' => wc_get_order_status_name( $order->get_status() ),
			'totalGrosze' => (int) round( (float) $order->get_total() * 100 ),
			'key'    => $order->get_order_key(),
			'email'  => $order->get_billing_email(),
		);
	}
	return wertes_private_response( $summaries );
}

function wertes_save_address( WP_REST_Request $request ) {
	$user_id = wertes_signed_in_user_id();
	if ( 0 === $user_id ) {
		return wertes_signed_out_error();
	}
	$address = array();
	foreach ( WERTES_ADDRESS_FIELDS as $field ) {
		$address[ $field ] = sanitize_text_field( (string) $request->get_param( $field ) );
	}
	foreach ( WERTES_REQUIRED_FIELDS as $field ) {
		if ( '' === $address[ $field ] ) {
			return new WP_Error( 'wertes_missing_field', 'Uzupełnij wszystkie wymagane pola.', array( 'status' => 400 ) );
		}
	}
	foreach ( $address as $field => $value ) {
		update_user_meta( $user_id, 'billing_' . $field, $value );
	}
	return wertes_private_response( wertes_account_of( $user_id ) );
}

function wertes_sign_in( WP_REST_Request $request ) {
	$user = wp_authenticate( (string) $request->get_param( 'login' ), (string) $request->get_param( 'password' ) );
	if ( is_wp_error( $user ) ) {
		return new WP_Error( 'wertes_wrong_credentials', 'Nieprawidłowy e-mail albo hasło.', array( 'status' => 401 ) );
	}
	wertes_start_session( $user->ID );
	return wertes_private_response( wertes_account_of( $user->ID ) );
}

function wertes_sign_out() {
	$session = wertes_session_from_cookie();
	if ( null !== $session ) {
		$tokens = wertes_live_tokens( $session['user_id'] );
		unset( $tokens[ $session['token_hash'] ] );
		update_user_meta( $session['user_id'], WERTES_ACCOUNT_TOKENS_META, $tokens );
	}
	wertes_set_session_cookie( '', time() - HOUR_IN_SECONDS );
	return wertes_private_response( array( 'signedOut' => true ) );
}

function wertes_register( WP_REST_Request $request ) {
	$email = sanitize_email( (string) $request->get_param( 'email' ) );
	if ( ! is_email( $email ) ) {
		return new WP_Error( 'wertes_invalid_email', 'Podaj poprawny adres e-mail.', array( 'status' => 400 ) );
	}
	if ( email_exists( $email ) ) {
		return new WP_Error( 'wertes_email_taken', 'Konto z tym adresem już istnieje. Zaloguj się albo ustaw nowe hasło.', array( 'status' => 409 ) );
	}
	$user_id = wc_create_new_customer( $email );
	if ( is_wp_error( $user_id ) ) {
		return new WP_Error( 'wertes_registration_failed', wp_strip_all_tags( $user_id->get_error_message() ), array( 'status' => 400 ) );
	}
	wertes_start_session( $user_id );
	return wertes_private_response( wertes_account_of( $user_id ) );
}

function wertes_send_password_reset( WP_REST_Request $request ) {
	$login = sanitize_text_field( (string) $request->get_param( 'login' ) );
	$user  = get_user_by( 'email', $login );
	if ( false === $user ) {
		$user = get_user_by( 'login', $login );
	}
	if ( false !== $user ) {
		$key = get_password_reset_key( $user );
		if ( ! is_wp_error( $key ) ) {
			WC()->mailer();
			do_action( 'woocommerce_reset_password_notification', $user->user_login, $key );
		}
	}
	return wertes_private_response( array( 'sent' => true ) );
}

function wertes_set_new_password( WP_REST_Request $request ) {
	$password = (string) $request->get_param( 'password' );
	if ( strlen( $password ) < WERTES_PASSWORD_MIN_LENGTH ) {
		return new WP_Error( 'wertes_short_password', 'Hasło musi mieć co najmniej 8 znaków.', array( 'status' => 400 ) );
	}
	$checked_user = check_password_reset_key( (string) $request->get_param( 'key' ), (string) $request->get_param( 'login' ) );
	if ( is_wp_error( $checked_user ) ) {
		return wertes_expired_reset_link_error();
	}
	reset_password( $checked_user, $password );
	delete_user_meta( $checked_user->ID, WERTES_ACCOUNT_TOKENS_META );
	wertes_start_session( $checked_user->ID );
	return wertes_private_response( wertes_account_of( $checked_user->ID ) );
}

function wertes_account_of( $user_id ) {
	$user    = get_userdata( $user_id );
	$address = array();
	foreach ( WERTES_ADDRESS_FIELDS as $field ) {
		$address[ $field ] = (string) get_user_meta( $user_id, 'billing_' . $field, true );
	}
	return array(
		'email'   => $user->user_email,
		'address' => $address,
	);
}

function wertes_start_session( $user_id ) {
	$token      = bin2hex( random_bytes( 32 ) );
	$expires_at = time() + WERTES_ACCOUNT_LIFETIME_DAYS * DAY_IN_SECONDS;
	$tokens     = wertes_live_tokens( $user_id );

	$tokens[ hash( 'sha256', $token ) ] = $expires_at;
	update_user_meta( $user_id, WERTES_ACCOUNT_TOKENS_META, $tokens );
	wertes_set_session_cookie( $user_id . '.' . $token, $expires_at );
}

function wertes_signed_in_user_id() {
	$session = wertes_session_from_cookie();
	if ( null === $session ) {
		return 0;
	}
	$tokens        = wertes_live_tokens( $session['user_id'] );
	$token_is_live = isset( $tokens[ $session['token_hash'] ] );
	if ( ! $token_is_live ) {
		return 0;
	}
	return $session['user_id'];
}

function wertes_session_from_cookie() {
	if ( ! isset( $_COOKIE[ WERTES_ACCOUNT_COOKIE ] ) ) {
		return null;
	}
	$parts = explode( '.', sanitize_text_field( wp_unslash( $_COOKIE[ WERTES_ACCOUNT_COOKIE ] ) ) );
	if ( 2 !== count( $parts ) ) {
		return null;
	}
	return array(
		'user_id'    => (int) $parts[0],
		'token_hash' => hash( 'sha256', $parts[1] ),
	);
}

function wertes_live_tokens( $user_id ) {
	$tokens = get_user_meta( $user_id, WERTES_ACCOUNT_TOKENS_META, true );
	if ( ! is_array( $tokens ) ) {
		return array();
	}
	$live_tokens = array();
	foreach ( $tokens as $token_hash => $expires_at ) {
		if ( $expires_at > time() ) {
			$live_tokens[ $token_hash ] = $expires_at;
		}
	}
	return $live_tokens;
}

function wertes_set_session_cookie( $value, $expires_at ) {
	setcookie(
		WERTES_ACCOUNT_COOKIE,
		$value,
		array(
			'expires'  => $expires_at,
			'path'     => '/',
			'secure'   => is_ssl(),
			'httponly' => true,
			'samesite' => 'Lax',
		)
	);
}

function wertes_private_response( $body ) {
	$response = new WP_REST_Response( $body );
	$response->header( 'Cache-Control', 'private, no-store' );
	return $response;
}

function wertes_signed_out_error() {
	return new WP_Error( 'wertes_signed_out', 'Zaloguj się, żeby zobaczyć konto.', array( 'status' => 401 ) );
}

function wertes_expired_reset_link_error() {
	return new WP_Error( 'wertes_expired_reset_link', 'Link do zmiany hasła wygasł. Poproś o nowy.', array( 'status' => 400 ) );
}
