#!/usr/bin/env python3

import responder
from hashlib import sha1
import json
import os
import sys
import logging

# Map of all the gateways & devices for now
# Each gateway contains a dictionary of devices
# Likely migrate this to an actual database later
gateways = {}

# Create the RESPONDER app
# https://responder.kennethreitz.org/en/latest/quickstart.html
app = responder.API()

log = logging.getLogger(__file__)
#app.logger.addHandler(logging.StreamHandler(sys.stdout))

# FYI, logging:
# https://flask.palletsprojects.com/en/1.1.x/logging/#basic-configuration

# Generate "hardware IDs" per device
def generateHid(uid):
  return 'e954822c15b4e7a0c23a92b73edc1280722c3b34'
  #return sha1(uid.encode('utf-8')).hexdigest()

def toListing(objList):
  listSize = len(objList)
  return {
    'size' : listSize,
    'data' : objList,
    'page' : 1,
    'totalSize' : listSize,
    'totalPages' : 1,
  }

# Welcome :) using this as a catch-all for all the methods we haven't implemented.
# stolen from here: https://flask.palletsprojects.com/en/1.1.x/patterns/singlepageapplications/
@app.route('/', default=True)
async def welcome(req, resp):
  # fwiw, fails if there's no media.
  #data = await req.media()
  #log.debug("request: {data}")
  resp.media = {"default": f"🤖😻\n"}

def get_gateways(req, resp):
  resp.media = toListing(list(gateways.keys()))

@app.route('/api/v1/kronos/gateways')
async def manage_gateways(req, resp):
  if not req.method == 'post':
    return get_gateways(req, resp)
  #example of input data: {"name":"SF Gateway","uid":"smartfeeder-795ae773737d","osName":"FreeRTOS","type":"Local","softwareName":"SMART FEEDER","softwareVersion":"2.8.0","sdkVersion":"1.3.12"}
  payload = await req.media()
  log.info(f"payload: {payload}")

  # Ensure all gateways have a "uid"
  if 'uid' not in payload:
    log.warning("gateway didn't contain a UID, returning 400")
    resp.status_code = api.status_codes.HTTP_400

  # Generate the HID
  hid = generateHid(payload['uid'])

  # Check if we already have this gateway
  if hid in gateways:
    resp.media = {
      "hid" : hid,
      "links" : {},
      "message" : "gateway is already registered"
    }
    return
  else:
    # Add to our gateways
    gateways[hid] = {}
    resp.media = {
      "hid": hid,
      "links": {},
      "message": "OK"
    }
    resp.set_cookie('JSESSIONID', value='pjbKBnNnas6qblrovritCihhHivY2WjFHc--S97u')
    return


# Fetch or create a device
@app.route('/api/v1/kronos/devices')
async def manage_devices(req, resp):
  if not req.method == 'post':
    return get_devices(req, resp)
  # Handle POST (create)
  device = await req.media()

  # Ensure all devices have a "gatewayHid"
  if 'gatewayHid' not in device:
    log.warning("device didn't contain a gatewayHid, returning 400")
    resp.status_code = api.status_codes.HTTP_400
    return
  # Ensure all devices have a "uid"
  if 'uid' not in device:
    log.warning("device didn't contain a UID, returning 400")
    resp.status_code = api.status_codes.HTTP_400
    return

  # Ensure the gateway exists
  if device['gatewayHid'] not in gateways:
    log.warning("device's gateway does not exist, returning 400")
    resp.status_code = api.status_codes.HTTP_400
    return
  # Fetch the gateway HID
  gatewayHid = device['gatewayHid']

  # Generate the HID
  hid = generateHid(device['uid'])
  # Check if we already have this device
  if hid in gateways[gatewayHid]:
    resp.media = {
      "hid" : hid,
      "links" : {},
      "message" : "device is already registered"
    }
    log.info(f"existing reg: {resp.media}")
    return
  # else We don't have this device, so add it
  gateways[gatewayHid][hid] = device
  resp.media = {
    "hid" : hid,
    "links" : {},
    "message" : "device was registered successfully"
  }
  log.info(f"new reg: {resp.media}")




def get_devices(req, resp):
  # Handle GET (fetch)
  # Check if we want the devices of a specific gateway
  gatewayHid = req.params.get('gatewayHid')
  if gatewayHid:
    # Ensure the gateway exists
    if gatewayHid not in gateways:
      resp.status_code = api.status_codes.HTTP_400
      return
    resp.media = toListing(list(gateways[gatewayHid].values()))
    return
  else:
    # No specific gateway specified, return all devices for now
    deviceLists = [x.values() for x in gateways.values()]
    devices = [entry for sublist in deviceLists for entry in sublist]
    resp.media = toListing(devices)
    return


@app.route('/api/v1/kronos/gateways/{gateway_id}/config')
async def gateway_config(req, resp, gateway_id):
  resp.media = {
    "cloudPlatform": "IotConnect",
    "key": {
      "apiKey": "efa2396b6f0bae3cc5fe5ef34829d60d91b96a625e55afabcea0e674f1a7ac43",
      "secretKey": "gEhFrm2hRvW2Km47lgt9xRBCtT9uH2Lx77WxYliNGJI="
    }
  }




# Run the app if we're executing this file
if __name__ == '__main__':
  if os.environ.get('USER', 'nope') == 'root':
    # run with SSL enabled (on the same port); not defaulting because it requires sudo to start.
    # instaed, could put in haproxy or use iptables: https://superuser.com/a/1334552
    app.run(ssl_keyfile="pkey.pem", ssl_certfile="cert.pem", address='0.0.0.0', port=443, debug=True)
  else:
    # note that by default, we'll only serve traffic to localhost.
    app.run()

