import asyncio
import re

from hbmqtt.plugins.topic_checking import BaseTopicPlugin
from feeder.util.mqtt.authentication import local_username


class PetnetTopicPlugin(BaseTopicPlugin):
    feeder_sub_topic_regex = re.compile(
        r"krs/(api|cmd)/stg/(?P<gateway_id>.*)$")
    username_regex = re.compile(r'^/pegasus:(?P<gateway_id>.*)$')

    def __init__(self, context):
        super().__init__(context)

    @asyncio.coroutine
    async def topic_filtering(self, *args, **kwargs):
        filter_result = super().topic_filtering(*args, **kwargs)
        if not filter_result:
            return False

        session = kwargs.get('session', None)
        topic = kwargs.get('topic', None)
        self.context.logger.debug('username: %s, topic: %s' %
                                  (session.username, topic))

        if session.username == local_username:
            return True

        if not topic:
            return False

        user_match = self.username_regex.match(session.username)
        if not user_match:
            return False

        gateway_id = user_match.group('gateway_id')

        topic_match = self.feeder_sub_topic_regex.match(topic)
        if not topic_match:
            return False

        target_id = topic_match.group('gateway_id')
        if gateway_id != target_id:
            self.context.logger.warning('Gateway %s tried to subscribe to %s'
                                        % (gateway_id, target_id))
            return False

        return True
