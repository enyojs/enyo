#!/bin/bash

# the folder this script is in (*/enyo/tools)
TOOLS="$(cd `dirname $0`; pwd)"
# enyo location
ENYO="$TOOLS/.."
# minify script location
MINIFY="$TOOLS/minifier/minify.js"

# check for node, but quietly
if command -v node >/dev/null 2>&1; then
	# use node to invoke minify with a known path to enyo and imported parameters
	echo "enyo/tools/minify.sh args: " $@
	node "$MINIFY" -enyo "$ENYO" $@
else
	echo "No node found in path"
	exit 1
fi
