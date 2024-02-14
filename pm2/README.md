npm install express pm2

pm2 start app.js

pm2 list


pm2 start app.js --watch -f

pm2 scale app 4   ----------number of instance can set
