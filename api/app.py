from flask import Flask, request, Response
from hashlib import sha1
import json

# Map of all the devices for now
# Likely migrate this to an actual database later
devices = {}

# Create the flask app
app = Flask(__name__)

# Generate "hardware IDs" per device
def generateHid(uid):
    return sha1(uid.encode('utf-8')).hexdigest()

# Welcome :)
@app.route('/')
@app.route('/api')
@app.route('/api/v1')
def welcome():
    return "🤖😻"

# Fetch or create a device
@app.route('/api/v1/kronos/devices', methods=['GET', 'POST'])
def manage_devices():
    # Handle POST (create)
    if request.method == 'POST':
        device = request.json
        # Ensure all devices have a "uid"
        if 'uid' not in device:
            return Response(status=400)
        # Generate the HID
        hid = generateHid(device['uid'])
        # Check if we already have this device
        if hid in devices:
            return {
                "hid" : hid,
                "links" : {},
                "message" : "device is already registered"
            }
        else:
            # We don't have this device, so add it
            devices[hid] = device
            return {
                "hid" : hid,
                "links" : {},
                "message" : "device was registered successfully"
            }
        return Response(status=200)

    # Handle GET (fetch)
    elif request.method == 'GET':
        # For now, allow us to fetch all of the devices
        return json.dumps(devices)

# Run the app if we're executing this file
if __name__ == '__main__':
    app.run()