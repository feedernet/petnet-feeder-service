# Experimental web interface

This is an experimental web interface that assumes you have set up your
PetNet Feeder V2 already. There is not a way to set up the WiFi credentials
in this repository.

## Network setup

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

You need to make sure the Python modules are available. It is useful to
use virtualenv to make sure your global Python libraries are not polluted.

```
pip install virtualenv
virtualenv venv
. venv/bin/activate
pip install -r ../requirements.txt
```

Simply use:

```
./main.py -d
```
