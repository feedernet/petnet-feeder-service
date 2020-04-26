from config import Config
import json
from request import Request
import sys

cmd = sys.argv[1]

# https://developer.konexios.io/
# https://api.konexios.io/swagger-ui.html#/ibm-integration-api
# https://github.com/konexios/moonstone/blob/master/kronos-api/src/main/java/com/arrow/kronos/api/DeviceApi.java

# uid, userHid, nodeHid don't work
#works
# logs = has some entries
# test-results = has a few results
# location = "lastLocation not found"
# state=there but empty

# gateways/f0385169de5d0965d34734b7016b83f93b15c5e3/config
#  /logs
#  /config
#  /devices

# kronos/nodes (customers, basically)
# kronos/nodes/types (staging level)
# kronos/rtu/find (two entries, firmware)
# kronos/software/releases/schedules (zillions)

# to test: telemetry, device-action-api
# kronos/devices/actions/types



if True:
  retj = Request.create('GET', f'https://api.arrowconnect.io/api/v1/{cmd}', {
        #'_size': 200,
        #'_page': pagenum,
        #'statuses': True,
      })
  print(json.dumps(retj, indent=2))

def hid(cmd):
  retj = Request.create('GET', f'https://api.arrowconnect.io/api/v1/kronos/devices/91bddfcd3e7ef7227c2a7eb40771c415affddc5c/{cmd}',
    {
      #'_size': 200,
      #'_page': pagenum,
      'statuses': True,
    })
  print(json.dumps(retj, indent=2))

def all_gateways():
  pagenum = 0
  totcount = 0
  while True:
    retj = Request.create('GET', 'https://api.arrowconnect.io/api/v1/kronos/gateways', {
        '_size': 200,
        '_page': pagenum,
      })
    print(retj)
    pagecount = len(retj['data'])
    if not pagecount: break
    totcount += pagecount
    print(f"got page {pagenum}, count {totcount}")

    pagenum += 1

def all_devices():
  pagenum = 0
  totcount = 0
  while True:
    retj = Request.create('GET', 'https://api.arrowconnect.io/api/v1/kronos/devices', {
        '_size': 200,
        '_page': pagenum,
      })
    print(retj)
    pagecount = len(retj['data'])
    if not pagecount: break
    totcount += pagecount
    print(f"got page {pagenum}, count {totcount}")

    pagenum += 1

#all_gateways()
