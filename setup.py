from setuptools import setup, find_packages

setup(
    name='feedernet',
    version='1.0.0',
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
