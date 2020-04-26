# petnet-api-hacking
trying to replicate the Petnet/Arrow API so our feeders work.

# What's the goal?

The goal is to have a _functioning_ Petnet feeder by rerouting the calls from the feeder to a local instance (e.g., Raspberry Pi) and allow us to manually feed and set schedules.

*Note* this doesn't include reproducing the mobile API. That'll be necessary to set up a new feeder, and for convenience, but it isn't necessary to get the feeder running.

# Architecture

To intercept calls without needing to hack an entire network, add a PiHole to your network (they're nice to have anyhow). We can then add entries to the PiHole's host file to steal traffic.

This traffic can talk to a local server, running Python-Flask. It can mock requests back to the feeder.

# How can I help?

If you have tech and coding experience, you can help! Drop me an email, ted@timmons.me, introduce yourself, and I'll send you a Slack invite. Current needs:

- run locally and intercept calls
- read the [Konexios documentation](https://developer.konexios.io/) and figure out what calls we need to make
- add on to the flask app
