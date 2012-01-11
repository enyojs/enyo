#!/bin/sh
TOOLS=../../tools
MINIFY=$TOOLS/minifier/minify.js
ENYO=../..
TARGET=./build

if command -v node >/dev/null 2>&1
then
	node $MINIFY package.js -enyo $ENYO -output enyo -no-alias
	mkdir $TARGET
	mv enyo.js enyo.css $TARGET
else
	echo "No node executable found!"
	exit 1
fi
