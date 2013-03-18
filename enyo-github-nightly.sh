#!/bin/bash

## enyo-github-nightly.sh
## shell script build step for https://gecko.palm.com/jenkins/view/Enyo/job/enyo-github-nightly/
## not intended to be run outside Jenkins environment!

## do our dependencies exist in the path?
## if not, update the path
if [ -z "`which npm`" ] ; then
  export PATH=$HOME/local/bin:$PATH
  if [ -z "`which npm`" ] ; then
    echo "*** can't find npm, exiting ***"
    exit 1
  fi
fi

# exit on any error
set -e

# download and unpack ares-tools
pushd /tmp
rm -rf ares-ide
tar -xzf ares-webos-cli-linux.tgz
rm ares-webos-cli-linux.tgz
export ARES_PACKAGE=/tmp/ares-ide/nodejs-module-webos-ipkg/bin/ares-package.sh
popd #/tmp

NODE_PATH=/usr/local/bin
ENYO_VER=nightly
ENYO_BUILD_DIRNAME="enyo-${ENYO_VER}"
SDK_STAMP=`date "+%Y%m%d"`
DIR_TIME=`date "+%H%M%S"`
SDK_DIRNAME="${ENYO_BUILD_DIRNAME}-${SDK_STAMP}${DIR_TIME}"
BOOTPLATE_DIRNAME="bootplate-${SDK_STAMP}${DIR_TIME}"
SDK_DIR="${WORKSPACE}"

# remove old builds and archives
find ${BUILD_DIR} -maxdepth 1 \( -name "enyo-*" \) -print0 | xargs -0 rm -rf
 
# build api-tool
echo && echo "... building api-tool ..."
pushd api-tool/tools
./deploy.sh
popd

# build bootplate
echo && echo "... building bootplate ..."
pushd bootplate
./tools/deploy.sh
popd

# build bootplate-mvc
##echo && echo "... building bootplate-mvc ..."
##pushd bootplate/tools
##./deploy.sh
##popd

# build sampler and redistributable IPK
echo && echo "... building sampler and IPK ..."
pushd sampler/tools
./deploy.sh
./deploy.sh -o ../www
cd ../projects
$ARES_PACKAGE webOS-nightly
popd

# copy built api-tool to bootplate
mv bootplate/api bootplate/api-old
cp -R api-tool/deploy/* bootplate/api
rm -rf bootplate/api/lib
cp bootplate/api-old/assets/manifest.json bootplate/api/assets
rm -rf bootplate/api-old

# move library repos into lib
rm -rf "lib"
mkdir -p lib
mv -t lib canvas extra fu g11n layout onyx

# Build minified enyojs
if command -v node >/dev/null 2>&1
then
	echo && echo "... building minified enyo ..."
	rm -rf "build"
	pushd ${SDK_DIR}/enyo/minify
	./minify.sh
	popd
	rm -rf "${SDK_DIR}/${ENYO_BUILD_DIRNAME}"
	mv "${SDK_DIR}/build" "${SDK_DIR}/${ENYO_BUILD_DIRNAME}"
else
	echo "No node executable found!"
	exit 1
fi

# strip BOM markers from any files that have them
# turn off strict error checking because grep not finding the BOM isn't a "fail"
set +e
echo
echo "Stripping BOM markers from any files that have them..."

find ${SDK_DIR} -type f | while read FILE ; do
	hexdump -n 3 "${FILE}" | grep -qs "ef bb bf"
	if [ $? -eq 0 ] ; then
		tail -c +4 "${FILE}" > /tmp/file.stripped
		mv /tmp/file.stripped "${FILE}"
	fi
done

# Add copyright statement to minified enyo build
echo
echo "Adding copyright statement to minified enyo build..."
COPYRIGHT="/* Enyo v2.0.0 | Copyright 2011-2012 Hewlett-Packard Development Company, L.P. | enyojs.com | enyojs.com/license */"
echo "${COPYRIGHT}" > /tmp/copyright
COPYRIGHT_FILE="/tmp/copyright"
#COPYRIGHT_FILE="enyo-apache-copyright.txt"
FILES=`find "${SDK_DIR}/${ENYO_BUILD_DIRNAME}" -name "*.js" -o -name "*.css"`
for FILE in ${FILES} ; do
	cat ${COPYRIGHT_FILE} ${FILE} > /tmp/file.copyrighted
	cp /tmp/file.copyrighted ${FILE}
done

# Move (Apache) license file:
echo
echo "Moving Apache license file..."
mv "${SDK_DIR}/enyo/LICENSE-2.0.txt" "${SDK_DIR}"

# remove ".DS_Store" files before zipping... create one first so there's no error if none exist
touch .DS_Store
find ${SDK_DIR} -name ".DS_Store" | xargs rm

# remove ".git" directories
find ${SDK_DIR} -name ".git" | xargs rm -rf
find ${SDK_DIR} -name ".gitignore" | xargs rm
find ${SDK_DIR} -name ".gitmodules" | xargs rm

# stage dir to be zipped
mkdir -p /tmp/${SDK_DIRNAME}
mv -t /tmp/${SDK_DIRNAME} ./*
mv -t . /tmp/${SDK_DIRNAME}

# set permissions
chmod -R ug+rwX,o+rX ${SDK_DIRNAME}

# and finally zip and scp the files to DreamHost
zip -qr ${SDK_DIRNAME}.zip ${SDK_DIRNAME} -x \*.git \*.gitignore \*.gitmodules
zip -qr ${BOOTPLATE_DIRNAME}.zip ${SDK_DIRNAME}/bootplate -x \*.git \*.gitignore \*.gitmodules
ssh enyojs@boxwood.dreamhost.com "mkdir -p ~/nightly"
ssh enyojs@boxwood.dreamhost.com "find ~/nightly/ -maxdepth 1 -type d -mtime +14 -exec echo \"Removing Directory => {}\" \; -exec rm -rf \"{}\" \;"
scp ${SDK_DIRNAME}.zip enyojs@boxwood.dreamhost.com:nightly/
scp ${BOOTPLATE_DIRNAME}.zip enyojs@boxwood.dreamhost.com:nightly/
ssh enyojs@boxwood.dreamhost.com "unzip -q ~/nightly/${SDK_DIRNAME}.zip -d ~/nightly/ && rm ~/nightly/${SDK_DIRNAME}.zip && ln -fsTv ~/nightly/${SDK_DIRNAME} ~/nightly/latest && ln -fsTv ~/nightly/${BOOTPLATE_DIRNAME}.zip ~/nightly/latest/bootplate-latest.zip"

echo "*** Done! ***"
echo
