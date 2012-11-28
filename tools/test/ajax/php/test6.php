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

        # $attachment_location = $_SERVER["DOCUMENT_ROOT"] . "/file.zip";
        $attachment_location = "redball.jpg";
        if (file_exists($attachment_location)) {

            header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
            header("Cache-Control: public"); // needed for i.e.
            header("Content-Type: image/jpeg");
            header("Content-Transfer-Encoding: Binary");
            header("Content-Length:".filesize($attachment_location));
            header("Content-Disposition: attachment; filename=redball.jpg");
            readfile($attachment_location);
            die();        
        } else {
            die("Error: File not found.");
        } 
}
