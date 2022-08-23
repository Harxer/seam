 #!/bin/bash

(cd ./service; npm install; pm2 stop HxRelayService; pm2 del HxRelayService; pm2 start HxRelayService.js)
