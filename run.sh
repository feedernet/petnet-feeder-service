#!/bin/bash -exv

# 
docker run -it -v ~/git/mitm/conf:/home/mitmproxy/.mitmproxy -p 8080:8080 -p 8081:8081 mitmproxy/mitmproxy mitmweb --set ssl_insecure=true

