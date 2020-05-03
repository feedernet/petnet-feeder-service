// Includes
const cookieParser = require('cookie-parser'),
    cors = require('cors'),
    crypto = require('crypto'),
    express = require('express'),
    https = require('https');

// Create our API server
let app = express();
// Use CORS
app.use(cors());
// Use JSON body handling
app.use(express.json());
// Use cookies - disable if we no longer need
app.use(cookieParser());

// Application we will run as
APPLICATION_ID = "38973487e8241ea4483e88ef8ca7934c8663dc25"

// Map of all the gateways & devices for now
// Each gateway contains a dictionary of devices
// Likely migrate this to an actual database later
gateways = {};

// SHA1
const sha1 = (input) => crypto.createHash('sha1').update(input).digest('hex');

// Generate "HID" per device
const generateHid = (uid) => {
  if (uid == 'smartfeeder-795ae773737d-prod') // ted
    return 'e954822c15b4e7a0c23a92b73edc1280722c3b34'
  console.log(`generating based on incoming uid: ${uid}`)
  return sha1(uid)
}

const generateGatewayHid = (uid) => {
  if (uid == 'smartfeeder-795ae773737d') // ted
    return '6ec68eb4db216f61822a9aa4333d9824ae7d1abc'
  console.warn(`seeing unknown feeder uid: ${uid}`)
  return sha1(uid)
}

const toListing = (objList) => {
    const listSize = objList.length;
    return {
        'size' : listSize,
        'data' : objList,
        'page' : 0,
        'totalSize' : listSize,
        'totalPages' : 1,
    };
};

app.route('/api/v1/kronos/gateways')
.get((_, res) => {
    gatewayObjects = Object.keys(gateways).map(gatewayHid => {
        return {
            "hid" : gatewayHid,
            "pri" : "arw:pgs:gwy:" + gatewayHid,
            "applicationHid" : APPLICATION_ID,
            "softwareName" : "SMART FEEDER",
            "softwareReleaseName" : "SMART FEEDER",
            "type" : "SMART FEEDER"
        };
    });
    res.json(toListing(gatewayObjects));
})
.post((req, res) => {
    // example of input data: {"name":"SF Gateway","uid":"smartfeeder-795ae773737d","osName":"FreeRTOS","type":"Local","softwareName":"SMART FEEDER","softwareVersion":"2.8.0","sdkVersion":"1.3.12"}
    const payload = req.body
    console.log(`gateway creation payload: ${JSON.stringify(payload)}`)

    // Ensure all gateways have a "uid"
    if (!('uid' in payload))
    {
        console.warn("gateway didn't contain a UID, returning 400");
        res.status(400).send();
    }

    // Generate the gateway HID
    //console.log(`generating based on incoming uid: ${uid}`)
    const gatewayHid = generateGatewayHid(payload['uid'])

    // Test setting the session cookie
    res.cookie('JSESSIONID', 'pjbKBnNnas6qblrovritCihhHivY2WjFHc--S97u');

    // Check if we already have this gateway
    if (gatewayHid in gateways)
    {
        res.json({
            "hid" : gatewayHid,
            //"links" : {},
            "message" : "gateway is already registered"
        });
        return
    }
    else
    {
        // Add to our gateways
        gateways[gatewayHid] = {}
        // Respond
        res.json({
            "hid": gatewayHid,
            //"links": {},
            "message": "OK"
        });
        return
    }
});

// Fetch or create a device
// this is the one currently failing. possibly relevant:
// https://github.com/konexios/konexios-sdk-android/blob/master/sample/src/main/java/com/konexios/sample/device/DeviceAbstract.java
// https://github.com/konexios/moonstone-docs/blob/master/kronos/device-firmware-management.pdf
// 
// this is called "register" in the C code, so we can think of this call as "device registration"
// https://github.com/konexios/konexios-sdk-c/blob/master/src/arrow/api/device/device.c#L14
app.route('/api/v1/kronos/devices')
.get((req, res) => {
    // Check if we want the devices of a specific gateway
    const gatewayHid = req.query.gatewayHid;
    // If so, ensure the gateway exists and return the devices
    if (gatewayHid)
    {
        if (gatewayHid in gateways)
        {
            res.json(toListing(Object.values(gateways[gatewayHid])))
        } else {
            // Gatway not found
            res.status(400).send();
        }
    // Otherwise, return all of the devices regardless of gateway
    } else {
        devices = Object.values(gateways).map(gateway => Object.values(gateway));
        res.json(toListing([].concat.apply([], devices)));
    }
})
.post((req, res) => {
    const device = req.body;

    console.log(`devices payload: ${JSON.stringify(device)}`);
    console.log(`devices headers: ${JSON.stringify(req.headers)}`);
  
    //# Ensure all devices have a "gatewayHid"
    if (!('gatewayHid' in device))
    {
      console.warn("device didn't contain a gatewayHid, returning 400");
      res.status(400).send();
      return;
    }

    // Ensure all devices have a "uid"
    if (!('uid' in device))
    {
      console.warn("device didn't contain a UID, returning 400");
      res.status(400).send();
      return;
    }

    // Fetch the provided gateway HID
    const gatewayHid = device['gatewayHid'];
  
    // Ensure the gateway exists
    if (!(gatewayHid in gateways))
    {
      console.warn("device's gateway does not exist, returning 400");
      res.status(400).send();
      return
    }
  
    // Generate the HID
    const hid = generateHid(device['uid'])
  
    let ret = {
      'hid': hid,
      'links' : {},
      'message' : 'device is already registered',
      // guessing at the following, they would be undocumented. hooray cargo culting!
      'pri' : 'arw:krn:dev:' + hid,
      //'deviceHid': hid,
      //'externalId': 'hello',
      //'enabled': True,
    };
  
    // Check if we already have this device
    if (hid in gateways[gatewayHid])
    {
        res.json(ret);
        return;
    }

    // Otherwise, we don't have this device, so add it
    gateways[gatewayHid][hid] = device
    // returning "already registered" (above) always.
    //ret['message'] = 'device was registered successfully'
    res.json(ret);
});

// this response can (also) be seen here:
// https://github.com/konexios/konexios-sdk-c/blob/master/src/arrow/api/gateway/gateway.c#L30
app.get('/api/v1/kronos/gateways/:gatewayId/config', (req, res) => {
    const gatewayId = req.params.gatewayId;
    console.log(`gw config gateway ID: ${gatewayId}`);
    console.log(`gw config headers: ${JSON.stringify(req.headers)}`);

    res.cookie('JSESSIONID', 'pjbKBnNnas6qblrovritCihhHivY2WjFHc--S97u')
    res.json({
        "cloudPlatform": "IotConnect",
        "key": {
            "apiKey": "efa2396b6f0bae3cc5fe5ef34829d60d91b96a625e55afabcea0e674f1a7ac43",
            "secretKey": "gEhFrm2hRvW2Km47lgt9xRBCtT9uH2Lx77WxYliNGJI="
        }
    });
});

app.use('/', (_, res) => {
    res.send("🤖😻");
});


// Determine which port to use
const isRoot = process.env.USER == "root";
const defaultPort = isRoot ? 443 : 3000;
const port = process.env.PORT || defaultPort;

const listenCallback = (err) => {
    // Show any errors we ran into
    if (err) console.error(err);
    // Check if this was run as sudo
    const uid = parseInt(process.env.SUDO_UID);
    // If so, switch back to that user now that the port is open and service is running
    if (uid) process.setuid(uid);
    console.log("༼ つ ◕_◕ ༽つ Pls Give PetNet");
};

if (isRoot)
{
    const httpsServer = https.createServer({
        key: fs.readFileSync('pkey.pem'),
        cert: fs.readFileSync('cert.pem'),
    }, app);
    httpsServer.listen(port, "0.0.0.0", listenCallback);
} else {
    app.listen(port, listenCallback);
}
