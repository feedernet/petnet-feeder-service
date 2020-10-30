# petnet-feeder-service

Reverse-engineering the PetNet feeders. So far v2 has been properly hacked!

This is an experimental web interface that assumes you have set up your
PetNet Feeder V2 already. There is not a way to set up the WiFi credentials
in this repository.

# Network setup

To intercept calls without needing to hack an entire network, you will need
to add a PiHole to your network (they're nice to have anyhow). TKTK.

## DNS spoofing

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

## Firewall setup

For this step you need to set up NAT for the fake address that you
used before (e.g., `172.4.0.1`). If the source and destination are
on the same network, you'll need to make sure it's a hairpin NAT so that
the source addresses are translated to something else as well.

### IPTables

In this example, I'm assuming you're redirecting to the actual server
at address `192.168.1.10` from the fake address:

```
iptables -t nat -A PREROUTING -i eth0 -p tcp -d 172.4.0.1 --dport 80 -j DNAT --to 192.168.1.10:5000
iptables -t nat -A PREROUTING -i eth0 -p tcp -d 172.4.0.1 --dport 1883 -j DNAT --to 192.168.1.10:1883
iptables -t nat -A PREROUTING -i eth0 -p tcp -d 172.4.0.1 --dport 8883 -j DNAT --to 192.168.1.10:8883
```

Please note that you can also have the container running in your local network and will not need to modify IPTables. For example if you local network is on 192.168.1.x and your container's IP address is 192.168.1.10, point your local DNS resolver to that IP address and you do not need to add iptable entries.

# Running the app

You will need to run some form of SSL proxy (NGINX, Traefik, etc.) in front of this service.
The SSL service is required and will need to listen on 443 and reverse proxy back to the docker container service on port 5000.
You will need to generate a self-signed certificate for it. It can be generated with openssl:

```
  sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/cert.key -out /etc/nginx/cert.crt 
```

If you are using NGINX, your config will look like this:

```nginx
    server {
        listen       443 ssl;
        server_name  [SERVER_NAME];

    ssl_certificate           /etc/nginx/cert.crt;
    ssl_certificate_key       /etc/nginx/cert.key;

    ssl on;
    ssl_session_cache  builtin:1000  shared:SSL:10m;
    ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;
    ssl_prefer_server_ciphers on;

    location / {
         proxy_pass http://[CONTAINER_IP]:5000;
         proxy_redirect http://[CONTAINER_IP]:5000 https://[SERVER_NAME]:443;
    }
```

Where:
* [SERVER_NAME] needs to be consistent with your self-signed certificate common name.
* [CONTAINER_IP] is the IP address of the docker container you are running.

## docker

```
docker run -d \
  --name=petnet-feeder-service \
  -p 5000:5000 \
  -p 8883:8883 \
  --restart unless-stopped \
  tedder42/petnet-feeder-service
```

## docker-compose

```yaml
---
version: "2.1"
services:
  feeder-service:
    image: tedder42/petnet-feeder-service
    container_name: petnet-feeder-service
    environment:
      - DATABASE_PATH=/data/data.db
      - MQTTS_PRIVATE_KEY=/data/cert.pem
      - MQTTS_PUBLIC_KEY=/data/pkey.pem
      # To serve the frontend and API under a different root path
      # define that path using the APP_ROOT variable.
      # - APP_ROOT=/petnet
    ports:
      - 5000:5000
      - 8883:8883
    volumes:
      - "/local/path:/data"
    restart: unless-stopped
```

## Parameters

| Parameter | Function |
| :----: | --- |
| `-p 5000:5000` | The HTTP access port for the webserver. |
| `-p 8883:8883` | The MQTT TLS port for the PetNet feeder. |

# Developing

You need to make sure the Python modules are available.

```
pip install --editable .
```

To run the daemon locally:

```
python -m feeder
```

## Database and Schema Migrations

This project uses SQLAlchemy and Alembic for managing database models and schema migrations.

If you change a database model and need to generate a migration, Alembic can do that for you automatically!

```shell script
DATABASE_PATH=./data.db alembic revision --autogenerate -m "Changing something about the models."
```

This will create a migration script in `feeder/database/alembic/versions`.

To apply these changes to your database, run:

```shell script
DATABASE_PATH=./data.db alembic upgrade head
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
