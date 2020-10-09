#!/usr/bin/env python3

import argparse
import asyncio
import coloredlogs
import logging
import yaml
import mqttclient
import mqttserver
import responderapp
import signal
import sys
import task_logger

class Main:
  config = {}
  webapp = None
  broker = None

  async def shutdown(self, signal, loop):
    """Cleanup tasks tied to the service's shutdown."""
    logging.info(f"Received exit signal {signal.name}...")

    logging.info(f"Shutting down tasks gracefully...")
    shutdown_tasks = [x.shutdown() for x in self.webapps + [self.broker] if x is not None]
    await asyncio.gather(*shutdown_tasks, return_exceptions=True)

    tasks = [t for t in asyncio.all_tasks() if t is not
             asyncio.current_task()]
  
    [task.cancel() for task in tasks]
  
    logging.info(f"Cancelling outstanding tasks")
    await asyncio.gather(*tasks, return_exceptions=True)
    loop.stop()
  
  async def install_signal_handlers(self, loop):
    for sig in (signal.SIGINT, signal.SIGTERM, signal.SIGQUIT):
      loop.add_signal_handler(sig, lambda sig=sig: asyncio.create_task(self.shutdown(sig, loop)))
  
  def read_config(self, *, file):
    with open(file) as f:
      self.config = yaml.load(f, Loader=yaml.FullLoader)
  
  @staticmethod
  def handle_exception(loop, context):
    if 'exception' in context:
      logging.error("Caught global exception:", exc_info = context["exception"])
    else:
      msg = context["message"]
      logging.error(f"Caught global exception: {msg}")

  def main(self, args):
    # Set up configuration of app
    parser = argparse.ArgumentParser(prog='main')
    parser.add_argument('--debug', '-d', action='store_true')
    parser.add_argument('--config', '-c', help='config file')
    parser.add_argument('--ssl_keyfile', help='PEM-encoded SSL private key file')
    parser.add_argument('--ssl_certfile', help='PEM-encoded SSL certificate')
    pargs = parser.parse_args(args)

    log_level = 'DEBUG' if pargs.debug else 'INFO'
    coloredlogs.install(fmt='%(asctime)s.%(msecs)03d %(levelname)s %(name)s :: %(message)s', level=log_level)

    config_file = pargs.config if pargs.config else 'config.yml'
    self.read_config(file=config_file)

    if pargs.ssl_keyfile:
      self.config['webapp']['listeners']['tls']['ssl_keyfile'] = pargs.ssl_keyfile
      self.config['mqtt']['server']['listeners']['tcp-ssl-1']['keyfile'] = pargs.ssl_keyfile
    if pargs.ssl_certfile:
      self.config['webapp']['listeners']['tls']['ssl_certfile'] = pargs.ssl_certfile
      self.config['mqtt']['server']['listeners']['tcp-ssl-1']['cafile'] = pargs.ssl_certfile
      self.config['mqtt']['server']['listeners']['tcp-ssl-1']['certfile'] = pargs.ssl_certfile

    # Set up tasks
    loop = asyncio.get_event_loop()
    loop.set_exception_handler(self.handle_exception)

    self.broker = mqttserver.create(loop, self.config['mqtt']['server'])
    self.client = mqttclient.create(loop, self.config['mqtt']['client'])
    self.webapps = responderapp.create(loop, self.config['webapp'], mqtt=self.client, debug=pargs.debug)
  
    logger = logging.getLogger('task_logger')
    tasks = [task_logger.create_task(x.serve(), logger=logger, message='Webapp raised exception', loop=loop) for x in self.webapps] + [
      task_logger.create_task(self.broker.start(), logger=logger, message='MQTT broker raised exception', loop=loop),
      task_logger.create_task(self.client.start(), logger=logger, message='MQTT client raised exception', loop=loop),
      loop.create_task(self.install_signal_handlers(loop)),
    ]
  
    try:
      loop.run_forever()
    finally:
      try:
        loop.close()
      except:
        pass
  
# Run the app if we're executing this file
if __name__ == '__main__':
  main = Main()
  main.main(sys.argv[1:])
