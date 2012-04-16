<?php
$method = @$_SERVER['REQUEST_METHOD'];
switch ($method) {
	case 'POST':
		post();
		break;
	case 'DELETE':
		delete();
		break;
	case 'PUT':
		put();
		break;
	default:
		echo "invalid method";
}

function post() {
	$q = @$_POST['query'];
	if ($q) {
		$result = array('response' => $q);
	} else {
		$result = array('response' => file_get_contents('php://input'));
	}
	$requested_with = @$_SERVER['HTTP_X_REQUESTED_WITH'];
	if ($requested_with == 'XMLHttpRequest') {
		$result['isAjax'] = true;
	}
	echo json_encode($result);
}

function put() {
	$result = array('status' => "put");
	echo json_encode($result);
}

function delete() {
	$result = array('status' => "delete");
	echo json_encode($result);
}
?>