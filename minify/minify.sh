#!/bin/sh
cd $(dirname $0)
../tools/minify.sh package.js -no-alias -output ../../build/enyo
