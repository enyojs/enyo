<?php
$method = @$_SERVER['REQUEST_METHOD'];
switch ($method) {
	case 'GET':
		get();
		break;
	default:
		echo "invalid method";
}

function get() {
	sleep(3);
	$result = array('status' => "get");
	echo json_encode($result);
}
