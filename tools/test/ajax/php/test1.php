<?php
$format = @$_GET['format'];
$callback = @$_GET['callback'];
if ($format == 'text') {
	echo 'hello';
} elseif ($format == 'xml') {
	header('Content-Type: text/xml');
	echo '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
	echo "<response>hello</response>";
} elseif ($format == 'jsonp') {
	header('Content-Type: text/javascript');
	echo "$callback(";
	echo json_encode(array('response' => 'hello', 'utf8' => 'Ви́хри'));
	echo ');';
} else {
	echo json_encode(array('response' => 'hello'));
}
?>