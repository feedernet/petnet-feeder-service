import asyncio
import re

from hbmqtt.plugins.authentication import BaseAuthPlugin
from feeder.database.models import KronosGateways
from secrets import token_hex


local_username = "local_%s" % token_hex(8)
local_password = token_hex(16)


class PetnetAuthPlugin(BaseAuthPlugin):
    username_regex = re.compile(r'^/pegasus:(?P<gateway_id>.*)$')

    def __init__(self, context):
        super().__init__(context)

    @asyncio.coroutine
    async def authenticate(self, *args, **kwargs):
        authenticated = super().authenticate(*args, **kwargs)
        if not authenticated:
            return False

        session = kwargs.get('session', None)
        self.context.logger.debug('username: %s' % session.username)
        if not session.username:
            return False

        if session.username == local_username:
            return session.password == local_password

        matches = self.username_regex.match(session.username)
        if not matches:
            return False

        gateway_id = matches.group('gateway_id')
        try:
            gateways = await KronosGateways.get(gateway_hid=gateway_id)
            return gateways[0]['apiKey'] == session.password
        except Exception:
            return False
