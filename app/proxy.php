<?php
  include 'config.php';                                     // Include the configuration


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
        "state" => "all"
      );
      break;
  }


  $curl = curl_init();                                      // Initialize the curl request
  $data_string = json_encode($data);                        // Set some options
  curl_setopt_array($curl, array(
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_URL => $url,
    CURLOPT_POSTFIELDS => $data_string,
    CURLOPT_HTTPHEADER => array(
      'Content-Type: application/json; charset=UTF-8',
      'Content-Length: ' . strlen($data_string),
      'X-Accept: application/json'
    )));
  $result = curl_exec($curl);                               // Run the request
  curl_close($curl);                                        // Close the request


  header('Content-Type: application/json;');
  //header("Access-Control-Allow-Origin: *");               // Uncomment for development
  print $result;
?>
