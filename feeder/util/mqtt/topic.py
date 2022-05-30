import re
import logging

from amqtt.broker import Action
from amqtt.plugins.topic_checking import BaseTopicPlugin
from feeder.util.mqtt.authentication import local_username

logger = logging.getLogger(__name__)


class PetnetTopicPlugin(BaseTopicPlugin):
    feeder_sub_topic_regex = re.compile(r"krs/(api|cmd)/stg/(?P<gateway_id>.*)$")
    feeder_pub_topic_regex = re.compile(r"krs.(api|tel).gts.(?P<gateway_id>.*)$")
    username_regex = re.compile(r"^/pegasus:(?P<gateway_id>.*)$")

    async def topic_filtering(
        self, *args, **kwargs
    ):  # pylint: disable=invalid-overridden-method
        filter_result = super().topic_filtering(*args, **kwargs)
        if not filter_result:
            return False

        session = kwargs.get("session", None)
        action = kwargs.get("action", None)
        topic = kwargs.get("topic", None)
        logger.debug(
            "username: %s, action: %s, topic: %s", session.username, action, topic
        )

        if session.username == local_username:
            return True

        if not topic:
            return False

        user_match = self.username_regex.match(session.username)
        if not user_match:
            return False

        gateway_id = user_match.group("gateway_id")

        if action == Action.subscribe:
            topic_match = self.feeder_sub_topic_regex.match(topic)
        elif action == Action.publish:
            topic_match = self.feeder_pub_topic_regex.match(topic)
        else:
            logger.warning("Unhandled action %s", action)
            return False

        if not topic_match:
            return False

        target_id = topic_match.group("gateway_id")
        if gateway_id != target_id:
            logger.warning(
                "Gateway %s tried to %s to %s", gateway_id, action, target_id
            )
            return False

        return True
