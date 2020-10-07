#!/bin/bash -exv

BASE=$(dirname $(readlink -f $0))
# 
docker run -it -u $(id -u):$(id -g) -v $BASE/conf:/home/mitmproxy/.mitmproxy:z -p 7112:8080 -p 127.0.0.1:8081:8081 -e HOME=/home/mitmproxy mitmproxy/mitmproxy /bin/sh -c /usr/bin/mitmweb --set ssl_insecure=true

