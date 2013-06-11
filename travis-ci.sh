#!bin/bash
echo "*** Running JSHint" &&
jshint . &&
echo "*** Running core tests with phantomjs" &&
phantomjs tools/test/core/phantomjs-test.js &&
echo "*** Running ajax tests with phantomjs" &&
phantomjs tools/test/ajax/phantomjs-test.js
