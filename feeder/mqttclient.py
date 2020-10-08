import json
import logging
import asyncio
import random
import re
import string

from hbmqtt.client import MQTTClient, ClientException
from hbmqtt.mqtt.constants import QOS_1, QOS_2

class MqttGateway:
  def __init__(self, loop, config, *, client=None):
    self.client = MQTTClient(loop=loop, config=config) if client is None else client

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

  def build_command(self, command, args):
    payload = json.dumps(args)
    msg = {
        "hid": self.generate_task_id(),
        "name": "SendCommand",
        "encrypted": False,
        "parameters": {
            "deviceHid": "unused",
            "command": command,
            "payload": payload,
        },
    }
    return json.dumps(msg).encode('utf-8')

  async def send_cmd(self, gateway_id, command, args):
    packet = self.build_command(command, args)
    await self.client.publish(f"krs/cmd/stg/{gateway_id}", packet, qos=QOS_2)

  async def send_cmd_feed(self, gateway_id, *, portion=0.0625):
    await self.send_cmd(gateway_id, 'feed', {'portion': portion})

  async def send_cmd_button(self, gateway_id, *, enable=True):
      await self.send_cmd(gateway_id, 'button_enable_remote', {'enable': enable})

  async def send_cmd_reboot(self, gateway_id):
    await self.send_cmd(gateway_id, 'reboot', {})

  async def send_cmd_utc_offset(self, gateway_id, *, utc_offset=0):
    await self.send_cmd(gateway_id, 'utc_offset', {'utc_offset': utc_offset})

  async def send_cmd_schedule(self, gateway_id, *, active=True, feeding_id='aaaa', name='FEED2', portion=0.0625, reminder=False, time=43100):
    await self.send_cmd(gateway_id, 'schedule', {'active': active, 'feeding_id': feeding_id, 'name': name, 'portion': portion, 'reminder': reminder, 'time': time})

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
