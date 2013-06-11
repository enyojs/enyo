<?php
header('Content-Length: 10');

if (php_sapi_name() != 'cli-server') {
	@apache_setenv('no-gzip', 1);
}
@ini_set('zlib.output_compression', 0);
@ini_set('implicit_flush', 1);
for ($i = 0; $i < ob_get_level(); $i++) { ob_end_flush(); }
ob_implicit_flush(1);

echo "12345";

flush();
sleep(1);

echo "67890";

?>