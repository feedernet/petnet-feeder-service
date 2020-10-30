import json
import logging
import random
import re
import string

from hbmqtt.client import MQTTClient, ClientException
from hbmqtt.mqtt.constants import QOS_2

from feeder.database.models import KronosDevices, DeviceTelemetryData, FeedingResult

logger = logging.getLogger(__name__)


def generate_task_id():
    letters = string.ascii_lowercase
    return "".join(random.choice(letters) for i in range(32))


def build_command(device_id, command, args):
    payload = json.dumps(args)
    msg = {
        "hid": generate_task_id(),
        "name": "SendCommand",
        "encrypted": False,
        "parameters": {
            "deviceHid": device_id,
            "command": command,
            "payload": payload,
        },
    }
    return json.dumps(msg).encode("utf-8")


async def commit_telemetry_data(gateway_id: str, payload: dict):
    device_id = payload["_|deviceHid"]
    message_type = payload["s|msg_type"]
    if message_type == "hb":
        logger.debug("Sending ping for %s", device_id)
        await KronosDevices.ping(gateway_hid=gateway_id, device_hid=device_id)
    if message_type == "sensor":
        logger.info("Updating sensor information for %s", device_id)
        await DeviceTelemetryData.report(
            gateway_hid=gateway_id,
            device_hid=device_id,
            voltage=payload["f|voltage"] / 1000,
            usb_power=bool(payload["i|usb"]),
            charging=bool(payload["i|chg"]),
            ir=bool(payload["i|ir"]),
            rssi=payload["i|rssi"]
        )
    if message_type == "feed_result":
        logger.info("Committing feed result data for %s", device_id)
        await FeedingResult.report(
            device_hid=device_id,
            start_time=payload.get("i|stime"),
            end_time=payload.get("i|etime"),
            pour=payload.get("i|pour"),
            full=payload.get("i|full"),
            grams_expected=payload.get("f|e_g"),
            grams_actual=payload.get("f|a_g"),
            hopper_start=payload.get("f|h_s"),
            hopper_end=payload.get("f|h_e"),
            source=payload.get("i|src"),
            fail=payload.get("b|fail"),
            trip=payload.get("b|trip"),
            lrg=payload.get("b|lrg"),
            vol=payload.get("b|vol"),
            bowl=payload.get("b|bowl"),
            recipe_id=payload.get("s|rid"),
            error=payload.get("s|err")
        )


class FeederClient(MQTTClient):
    async def handle_message(self, packet):
        api_result = re.match(
            r"^krs\.api\.gts\.(?P<gateway_id>.*)$", packet.variable_header.topic_name
        )
        telemetry_result = re.match(
            r"^krs\.tel\.gts\.(?P<gateway_id>.*)$", packet.variable_header.topic_name
        )
        if api_result:
            gateway_id = api_result.groupdict()["gateway_id"]
            try:
                payload = json.loads(packet.payload.data)
            except UnicodeDecodeError:
                logger.exception("Failed to decode message: %s", packet.payload.data)
                return
            request_id = payload["requestId"]
            await self.create_request_ack(gateway_id, request_id)
        elif telemetry_result:
            gateway_id = telemetry_result.groupdict()["gateway_id"]
            try:
                payload = json.loads(packet.payload.data)
            except UnicodeDecodeError:
                logger.exception("Failed to decode message: %s", packet.payload.data)
                return
            await commit_telemetry_data(gateway_id, payload)
        else:
            logger.info(
                f"Unknown message: {packet.variable_header.topic_name} => {packet.payload.data}"
            )

    async def create_request_ack(self, gateway_id, request_id):
        reply = {
            "requestId": request_id,
            "eventName": "GatewayToServer_ApiRequest",
            "encrypted": False,
            "parameters": {"status": "OK"},
        }
        logger.debug("Publishing MQTT ACK: %s", reply)
        await self.publish(
            f"krs/api/stg/{gateway_id}", json.dumps(reply).encode("utf-8"), qos=QOS_2
        )

    async def send_cmd(self, gateway_id, device_id, command, args):
        packet = build_command(device_id, command, args)
        await self.publish(f"krs/cmd/stg/{gateway_id}", packet, qos=QOS_2)

    async def send_cmd_feed(self, gateway_id, device_id, *, portion=0.0625):
        await self.send_cmd(gateway_id, device_id, "feed", {"portion": portion})

    async def send_cmd_button(self, gateway_id, device_id, *, enable=True):
        await self.send_cmd(gateway_id, device_id, "button_enable_remote", {"enable": enable})

    async def send_cmd_reboot(self, gateway_id, device_id):
        await self.send_cmd(gateway_id, device_id, "reboot", {})

    async def send_cmd_utc_offset(self, gateway_id, device_id, *, utc_offset=0):
        await self.send_cmd(gateway_id, device_id, "utc_offset", {"utc_offset": utc_offset})

    async def send_cmd_schedule(
            self,
            gateway_id,
            *,
            active=True,
            feeding_id="aaaa",
            name="FEED2",
            portion=0.0625,
            reminder=False,
            time=43100,
    ):
        await self.send_cmd(
            gateway_id,
            "schedule",
            {
                "active": active,
                "feeding_id": feeding_id,
                "name": name,
                "portion": portion,
                "reminder": reminder,
                "time": time,
            },
        )

    async def start(self):
        await self.connect("mqtt://localhost:1883/")
        await self.subscribe([("#", QOS_2)])
        try:
            while True:
                message = await self.deliver_message()
                packet = message.publish_packet
                await self.handle_message(packet)

        except ClientException as ce:
            logging.error(f"mqtt-client exception: {ce}")
        except Exception:
            # We cannot let the client error out!
            logger.exception("Unhandled error in MQTT client!")
