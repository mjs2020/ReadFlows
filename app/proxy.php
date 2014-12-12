<?php
// Some inspiration from: https://github.com/cowboy/php-simple-proxy

include 'config.php';                                     // Include the configuration

// Check that this is coming from the same domain
$ref = $_SERVER['HTTP_REFERER'];
$refData = parse_url($ref);
if($refData['host'] !== 'play.fm.to.it') {
  // Stop execution
  die("Hotlinking not permitted, install proxy on your own server and use your own app key.");
}

// Check that this is an xmlhttprequest
if(empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
  die("No XMLHTTP request detected");
}

switch($_GET['a']) {                                      // Get what action we're trying to do
  case 'getRequestToken':
    $url = 'https://getpocket.com/v3/oauth/request';
    $data = array(
      "consumer_key" => $config['consumer_key'],
      "redirect_uri" => $config['redirect_uri']
    );
    break;
  case 'getAccessToken':
    $url = 'https://getpocket.com/v3/oauth/authorize';
    $data = array(
      "consumer_key" => $config['consumer_key'],
      "code" => $_GET['code']
    );
    break;
  case 'getReadsList':
    $url = 'https://getpocket.com/v3/get';
    $data = array(
      "consumer_key" => $config['consumer_key'],
      "access_token" => $_GET['accessToken'],
      "state" => "all",
      "detailType" => "complete"
    );
    if (isset($_GET['since'])) $data['since'] = $_GET['since'];
    break;
}


$curl = curl_init();                                      // Initialize the curl request
$data_string = json_encode($data);                        // Set some options
curl_setopt_array($curl, array(
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_URL => $url,
  CURLOPT_POSTFIELDS => $data_string,
  CURLOPT_HEADER => true,
  CURLOPT_USERAGENT => isset($_GET['user_agent']) ? $_GET['user_agent'] : $_SERVER['HTTP_USER_AGENT'],
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json; charset=UTF-8',
    'Content-Length: ' . strlen($data_string),
    'X-Accept: application/json'
  )));

// run the curl
list($header, $contents) = preg_split( '/([\r\n][\r\n])\\1/', curl_exec( $curl ), 2 );
$status = curl_getinfo( $curl );
curl_close($curl);                                        // Close the request

// Split header text into an array.
$header_text = preg_split( '/[\r\n]+/', $header );

foreach ( $header_text as $header ) {                     // Propagate headers to response.
  if ( preg_match( '/^(?:Content-Type|Content-Language|Set-Cookie|Cache-Control|Content-Length|Expires|X-)/i', $header ) ) {
    header( $header );
  }
}

header("Access-Control-Allow-Origin: *");                 // Uncomment for development

print $contents;

?>
