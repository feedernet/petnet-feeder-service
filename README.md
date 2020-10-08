# petnet-api-hacking

Reverse-engineering the PetNet feeders. So far v2 has been properly hacked!

This is an experimental web interface that assumes you have set up your
PetNet Feeder V2 already. There is not a way to set up the WiFi credentials
in this repository.

## Network setup

To intercept calls without needing to hack an entire network, you will need
to add a PiHole to your network (they're nice to have anyhow). TKTK.

### DNS spoofing

You must configure fake DNS addresses for some of the hosts which the
PetNet Feeder attempts to connect.

  * `api.arrowconnect.io`
  * `mqtt-a01.arrowconnect.io`

It doesn't matter what address this is pointing to, but I suggest an
address on the RFC 1918 scope that is not in your local network such
as `172.4.0.1`. You'll need to use this later in the firewall setup.

Doing an `nslookup` on the addresses should yield results like this:
```
$ nslookup api.arrowconnect.io
Server:         ::1
Address:        ::1#53

Name:   api.arrowconnect.io
Address: 172.4.0.1

$ nslookup mqtt-a01.arrowconnect.io
Server:         ::1
Address:        ::1#53

Name:   mqtt-a01.arrowconnect.io
Address: 172.4.0.1
```

### Firewall setup

For this step you need to set up NAT for the fake address that you
used before (e.g., `172.4.0.1`). If the source and destination are
on the same network, you'll need to make sure it's a hairpin NAT so that
the source addresses are translated to something else as well.

#### IPTables

In this example, I'm assuming you're redirecting to the actual server
at address `192.168.1.10` from the fake address:

```
iptables -t nat -A PREROUTING -i eth0 -p tcp -d 172.4.0.1 --dport 80 -j DNAT --to 192.168.1.10:7112
iptables -t nat -A PREROUTING -i eth0 -p tcp -d 172.4.0.1 --dport 443 -j DNAT --to 192.168.1.10:7112
iptables -t nat -A PREROUTING -i eth0 -p tcp -d 172.4.0.1 --dport 1883 -j DNAT --to 192.168.1.10:1883
iptables -t nat -A PREROUTING -i eth0 -p tcp -d 172.4.0.1 --dport 8883 -j DNAT --to 192.168.1.10:8883
```

### Running the app

#### docker

```
docker run -d \
  --name=petnet-feeder-service \
  -p 5000:5000 \
  -p 7112:7112 \
  -p 8883:8883 \
  --restart unless-stopped \
  tedder42/petnet-feeder-service
```

#### docker-compose

```yaml
---
version: "2.1"
services:
  bazarr:
    image: tedder42/petnet-feeder-service
    container_name: petnet-feeder-service
    ports:
      - 5000:5000
      - 7112:7112
      - 8883:8883
    restart: unless-stopped
```

### Parameters

| Parameter | Function |
| :----: | --- |
| `-p 5000:5000` | The HTTP access port for the webserver. |
| `-p 7112:7112` | The HTTPS access port for the webserver. |
| `-p 8883:8883` | The MQTT TLS port for the PetNet feeder. |

## Developing

You need to make sure the Python modules are available.

```
make init
```

To run the daemon locally:

```
cd feeder && ./main.py
```

# How can I help?

If you have tech and coding experience, you can help! Drop me an email,
ted@timmons.me, introduce yourself, and I'll send you a Slack invite.
I'm not looking for people who want to 'hang out', I need people willing
to contribute documentation or code. Current needs:

- more comprehensive installation instructions
- run locally and intercept calls
- read the [Konexios documentation](https://developer.konexios.io/) and
  figure out what calls we need to make
- add on to the app
- create a straightforward UI
