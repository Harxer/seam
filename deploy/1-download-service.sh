 #!/bin/bash

mkdir -p ./service

svn checkout https://github.com/$1.git/trunk/service ./service \
  --username harrisonbalogh@gmail.com \
  --password $SVN_SECRET \
  --no-auth-cache \
  --non-interactive
