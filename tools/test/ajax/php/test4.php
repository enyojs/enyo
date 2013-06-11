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
	$ctype = @$_SERVER["CONTENT_TYPE"];
	if ($ctype == null) {
		$ctype = @$_SERVER["HTTP_CONTENT_TYPE"];
	}
	$cacheCtrl = @$_SERVER["HTTP_CACHE_CONTROL"];
	$result = array('status' => "post" , 'ctype' => $ctype , 'cacheCtrl' => $cacheCtrl);
	echo json_encode($result);

	# useful for test setup...
	#foreach ($_SERVER as $name => $value) {
	#	echo "$name: $value\n";
	#}
}
?>