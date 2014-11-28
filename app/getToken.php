<?php
  // Config:
  $data = array(
    "consumer_key" => "33488-18e76c0f6330944dcc1d0582",
    "redirect_uri" => "http://play.fm.to.it/ReadsViz/"
  );



  // Initialize the curl
  $curl = curl_init();
  // Set some options
  $data_string = json_encode($data);
  curl_setopt_array($curl, array(
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_URL => 'https://getpocket.com/v3/oauth/request',
    CURLOPT_POSTFIELDS => $data_string,
    CURLOPT_HTTPHEADER => array(
      'Content-Type: application/json; charset=UTF-8',
      'Content-Length: ' . strlen($data_string),
      'X-Accept: application/json'
    )));

  $result = curl_exec($curl);
  curl_close($curl);
  header('Content-Type: application/json;');
  header("Access-Control-Allow-Origin: *"); // REMOVE AFTER DEVELOPMENT
  print $result;
?>
