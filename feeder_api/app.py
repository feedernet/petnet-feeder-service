#!/usr/bin/env python3

from flask import request, Response
import flask
from hashlib import sha1
import json
import os
import sys
import logging

# Map of all the gateways & devices for now
# Each gateway contains a dictionary of devices
# Likely migrate this to an actual database later
gateways = {}

# Create the flask app
app = flask.Flask(__name__)

app.logger.addHandler(logging.StreamHandler(sys.stdout))

# FYI, logging:
# https://flask.palletsprojects.com/en/1.1.x/logging/#basic-configuration

# Generate "hardware IDs" per device
def generateHid(uid):
  return sha1(uid.encode('utf-8')).hexdigest()

def toListing(objList):
  listSize = len(objList)
  return {
    'size' : listSize,
    'data' : objList,
    'page' : 0,
    'totalSize' : listSize,
    'totalPages' : 1,
  }

# Welcome :) using this as a catch-all for all the methods we haven't implemented.
# stolen from here: https://flask.palletsprojects.com/en/1.1.x/patterns/singlepageapplications/
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['GET', 'POST'])
def welcome(path):
  app.logger.debug("request: {request}")
  return f"🤖😻\n"

@app.route('/api/v1/kronos/gateways', methods=['GET'])
def get_gateways():
  return json.dumps(toListing(list(gateways.keys())))

@app.route('/api/v1/kronos/gateways', methods=['POST'])
def manage_gateways():
  #example of input data: {"name":"SF Gateway","uid":"smartfeeder-795ae773737d","osName":"FreeRTOS","type":"Local","softwareName":"SMART FEEDER","softwareVersion":"2.8.0","sdkVersion":"1.3.12"}
  payload = request.get_json(force=True)
  print(f"payload: {payload}")

  # Ensure all gateways have a "uid"
  if 'uid' not in payload:
    app.logger.warning("gateway didn't contain a UID, returning 400")
    return Response(status=400)

  # Generate the HID
  hid = generateHid(payload['uid'])

  # Check if we already have this gateway
  if hid in gateways:
    return flask.make_response({
      "hid" : hid,
      "links" : {},
      "message" : "gateway is already registered"
    })
  else:
    # Add to our gateways
    gateways[hid] = {}
    resp = flask.make_response({
      "hid": hid,
      "links": {},
      "message": "OK"
    })
    resp.set_cookie('JSESSIONID', 'pjbKBnNnas6qblrovritCihhHivY2WjFHc--S97u')
    return resp



# Fetch or create a device
@app.route('/api/v1/kronos/devices', methods=['POST'])
def manage_devices():
  app.logger.warning("yo")
  print("ff")
  # Handle POST (create)
  device = request.json

  # Ensure all devices have a "gatewayHid"
  if 'gatewayHid' not in device:
    app.logger.warning("device didn't contain a gatewayHid, returning 400")
    return Response(status=400)
  # Ensure all devices have a "uid"
  if 'uid' not in device:
    app.logger.warning("device didn't contain a UID, returning 400")
    return Response(status=400)

  # Ensure the gateway exists
  if device['gatewayHid'] not in gateways:
    app.logger.warning("device's gateway does not exist, returning 400")
    return Response(status=400)
  # Fetch the gateway HID
  gatewayHid = device['gatewayHid']

  # Generate the HID
  hid = generateHid(device['uid'])
  # Check if we already have this device
  if hid in gateways[gatewayHid]:
    return {
      "hid" : hid,
      "links" : {},
      "message" : "device is already registered"
    }
  # else We don't have this device, so add it
  gateways[gatewayHid][hid] = device
  return {
    "hid" : hid,
    "links" : {},
    "message" : "device was registered successfully"
  }


@app.route('/api/v1/kronos/devices', methods=['GET'])
def get_devices():
  # Handle GET (fetch)
  # Check if we want the devices of a specific gateway
  gatewayHid = request.args.get('gatewayHid')
  if gatewayHid:
    # Ensure the gateway exists
    if gatewayHid not in gateways:
      return Response(status=400)
    return flask.make_response(toListing(list(gateways[gatewayHid].values())))
  else:
    # No specific gateway specified, return all devices for now
    deviceLists = [x.values() for x in gateways.values()]
    devices = [entry for sublist in deviceLists for entry in sublist]
    return flask.make_response(toListing(devices))



# Run the app if we're executing this file
if __name__ == '__main__':
  if os.environ.get('USER', 'nope') == 'root':
    # run with SSL enabled (on the same port); not defaulting because it requires sudo to start.
    # instaed, could put in haproxy or use iptables: https://superuser.com/a/1334552
    app.run(ssl_context='adhoc', host='0.0.0.0', port=443, debug=True)
  else:
    # note that by default, we'll only serve traffic to localhost.
    app.run()

