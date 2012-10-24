@ECHO OFF
REM FIXME: minify has a problem if 'package.js' is not in CWD, hence push, cd, pop
PUSHD "%CD%"
CD "%~dp0"
CALL ..\tools\minify.bat package.js -no-alias -output ..\..\build\enyo %*
POPD
