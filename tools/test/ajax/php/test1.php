<?php
$format = $_GET['format'];
if ($format == 'text') {
	echo 'hello';
} elseif ($format == 'xml') {
	header('Content-Type: text/xml');
    echo '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
    echo "<response>hello</response>";
} else {
	echo json_encode(array('response' => 'hello'));
}
?>