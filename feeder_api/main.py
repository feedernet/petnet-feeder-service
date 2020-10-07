#!/usr/bin/env python3

import argparse
import asyncio
import logging
import yaml
import mqttserver
import responderapp
import signal
import sys

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
  
  def read_config(self):
    with open('responder.yml') as f:
      self.config = yaml.load(f, Loader=yaml.FullLoader)
  
  def main(self, args):
    # Set up configuration of app
    parser = argparse.ArgumentParser(prog='main')
    parser.add_argument('--debug', '-d', action='store_true')
    pargs = parser.parse_args(args)

    self.read_config()

    # Set up tasks
    loop = asyncio.get_event_loop()

    self.webapps = responderapp.create(loop, self.config['webapp'])
    self.broker = mqttserver.create(loop, self.config['mqtt']['server'])
  
    tasks = [loop.create_task(x.serve()) for x in self.webapps] + [
      loop.create_task(self.broker.start()),
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
