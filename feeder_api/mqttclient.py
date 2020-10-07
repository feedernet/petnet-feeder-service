import json
import logging
import asyncio
import random
import re
import string

from hbmqtt.client import MQTTClient, ClientException
from hbmqtt.mqtt.constants import QOS_1, QOS_2

class MqttGateway:
  def __init__(self, loop, config):
    self.client = MQTTClient(loop=loop, config=config)

  async def handle_message(self, packet):
    logging.info(f"mqtt-client message: {packet.variable_header.topic_name} => {packet.payload.data}")
    result = re.match(r'^krs\.api\.gts\.(?P<gateway_id>.*)$', packet.variable_header.topic_name)
    if result:
      gateway_id = result.groupdict()['gateway_id']
      payload = json.loads(packet.payload.data)
      request_id = payload['requestId']
      await self.create_request_ack(gateway_id, request_id)
  
  async def create_request_ack(self, gateway_id, request_id):
    reply = {'requestId': request_id, 'eventName': 'GatewayToServer_ApiRequest', 'encrypted': False, 'parameters': {'status': 'OK'}}
    await self.client.publish(f"krs/api/stg/{gateway_id}", json.dumps(reply).encode('utf-8'), qos=QOS_2)
  
  def generate_task_id(self):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(32))

  async def send_cmd_feed(self, gateway_id):
    msg = {
        "hid": self.generate_task_id(),
        "name": "SendCommand",
        "encrypted": False,
        "parameters": {
            "deviceHid": "unused",
            "command":"feed",
            "payload":"{\"portion\":1}"
        },
    }
    await self.client.publish(f"krs/cmd/stg/{gateway_id}", json.dumps(msg).encode('utf-8'), qos=QOS_2)

  async def start(self):
    await self.client.connect('mqtt://localhost:1883/')
    await self.client.subscribe([('krs.api.gts.#', QOS_2)])
    try:
      while True:
        message = await self.client.deliver_message()
        packet = message.publish_packet
        await self.handle_message(packet)
  
    except ClientException as ce:
      logging.error(f"mqtt-client exception: {ce}")

def create(loop, config):
  return MqttGateway(loop, config)
