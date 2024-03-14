<?php

  header('Content-Type: application/json;charset=utf-8');
  header('Access-Control-Allow-Origin: *');
  //set a dummy setting
  $lang='en';
  $cargo='false';
  $arrival='false';
  $date='2024-2-2';
  if (count($_GET) != 4) {
    http_response_code(400);
    echo "{\"problemNo\":\"xxxxxxxxxxxxxx\",\"message\":\"invalid query string\"}";
    exit();
  } 
  if (isset($_GET['lang']))
    $lang=urlencode($_GET['lang']);
  if (isset($_GET['cargo']))
    $cargo=urlencode($_GET['cargo']);
  if (isset($_GET['arrival']))
    $arrival=urlencode($_GET['arrival']);
  if (isset($_GET['date'])) {
    $date=urlencode($_GET['date']);  
  } else {
    http_response_code(400);
    echo "{\"problemNo\":\"xxxxxxxxxxxxxx\",\"message\":\"must provide a date string\"}";
    exit();    
  }

  $opts = array(
    'http'=>array(
      'protocol_version'=>1.1,
      'ignore_errors'=>true
    )
  );

  $context = stream_context_create($opts);

  try {
    $Odata = file_get_contents("https://www.hongkongairport.com/flightinfo-rest/rest/flights/past?date=$date&lang=$lang&cargo=$cargo&arrival=$arrival", false, $context);
  } catch (Exception $e) {
    echo $e->getMessage(), '\n';
  }
  if (boolval($Odata)) {
    $status_line = $http_response_header[0];
    preg_match('{HTTP\/\S*\s(\d{3})}', $status_line, $match);
    $status = $match[1];
    if ($status !== "200") {
      http_response_code(400);
      echo $Odata;
      exit();
    }
    echo $Odata;
  } else {
    http_response_code(400);
    echo "{\"problemNo\":\"xxxxxxxxxxxxxx\",\"message\":\"HTTP/1.1 400 Bad Request; check your date string\"}";
  }
?>