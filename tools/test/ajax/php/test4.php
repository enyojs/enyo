<?php
$method = @$_SERVER['REQUEST_METHOD'];
switch ($method) {
	case 'POST':
		post();
		break;
	default:
		echo "invalid method";
}

function post() {
	$c = @$_SERVER["CONTENT_TYPE"];
	$result = array('status' => "post", 'ctype' => $c);
	echo json_encode($result);
}
?>