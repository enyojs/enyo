REM don't watch the sausage being made
@ECHO OFF

REM the folder this script is in (*/enyo/tools)
SET TOOLS=%~DP0

REM enyo location
SET ENYO=%TOOLS%\..

REM lessc script location
SET LESSC=%TOOLS%\minifier\lessc.js

REM node location
SET NODE=node.exe

REM use node to invoke lessc with a known path to enyo and imported parameters
%NODE% "%LESSC%" -enyo "%ENYO%" %*
