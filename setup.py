from setuptools import setup, find_packages

setup(
    name='petnet-api-replacement',
    version='0.1dev',
    packages=find_packages(exclude=["tests", "*.tests", "*.tests.*", "tests.*"]),
    license='MIT',
    long_description=open('README.md').read(),
    entry_points={
        'hbmqtt.broker.plugins': [
            'auth_petnet = feeder.util.mqtt.authentication:PetnetAuthPlugin',
            'topic_petnet = feeder.util.mqtt.topic:PetnetTopicPlugin',
        ],
    },
)
