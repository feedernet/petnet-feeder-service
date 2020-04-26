from configparser import ConfigParser

class Config:
  _configParser = None

  @staticmethod
  def _getConfig():
    if not Config._configParser:
      Config._configParser = ConfigParser()
      Config._configParser.read('config.ini')
    return Config._configParser

  @staticmethod
  def getApiKey():
    return Config._getConfig()['api']['key']

  @staticmethod
  def getSecretKey():
    return Config._getConfig()['api']['secret']

  @staticmethod
  def getApiVersion():
    return 1