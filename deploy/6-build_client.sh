 #!/bin/bash

cd ./client
path=$HTTP_DIR/../demo/$2
mkdir -p $path
# Rebuild client to include release changes
(npm install; npm run build --production; cp -a ./build/. $path)
