import re
import logging

from hbmqtt.plugins.authentication import BaseAuthPlugin
from feeder.database.models import KronosGateways
from secrets import token_hex

logger = logging.getLogger(__name__)
local_username = "local_%s" % token_hex(8)
local_password = token_hex(16)


class PetnetAuthPlugin(BaseAuthPlugin):
    username_regex = re.compile(r"^/pegasus:(?P<gateway_id>.*)$")

    async def authenticate(self, *args, **kwargs):
        authenticated = super().authenticate(*args, **kwargs)
        if not authenticated:
            return False

        session = kwargs.get("session", None)
        logger.debug("MQTT Username: %s", session.username)
        if not session.username:
            return False

        if session.username == local_username:
            return session.password == local_password

        matches = self.username_regex.match(session.username)
        if not matches:
            return False

        gateway_id = matches.group("gateway_id")
        try:
            gateways = await KronosGateways.get(gateway_hid=gateway_id)
            success = gateways[0]["apiKey"] == session.password
            if not success:
                logger.warning(
                    "Feeder (%s) failed to provide the right password!", gateway_id
                )
            return success
        except Exception:
            return False
