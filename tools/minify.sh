#!/bin/bash

# the folder this script is in (*/enyo/tools)
TOOLS="$(cd `dirname $0`; pwd)"
# enyo location
ENYO="$TOOLS/.."
# minify script location
MINIFY="$TOOLS/minifier/minify.js"

for NODEJS in nodejs node; do
	# check for node, but quietly
	if command -v $NODEJS >/dev/null 2>&1; then
		# use node to invoke minify with a known path to enyo and imported parameters
		echo "enyo/tools/minify.sh args: " $@
		$NODEJS "$MINIFY" -enyo "$ENYO" $@
		FOUND=1
		break
	fi
done

if [ ! "$FOUND" ]; then
	echo "No nodejs found in path"
	exit 1
fi
