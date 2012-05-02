@ECHO OFF
PUSHD %CD%
CD %~dp0
REM FIXME: minify has a problem if 'package.js' is in CWD, hence push/pop
CALL ..\tools\minify.bat package.js -no-alias -output ..\build\enyo
POPD
