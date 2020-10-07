#!/usr/bin/env python3

from hbmqtt.broker import Broker

def create(loop, config):
  return Broker(loop=loop, config=config)
