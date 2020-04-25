from configparser import SafeConfigParser

class Config:
    _configParser = None

    @staticmethod
    def _getConfig():
        if not Config._configParser:
            Config._configParser = SafeConfigParser()
            Config._configParser.read('config.ini')
        return Config._configParser

    @staticmethod
    def getApiKey():
        return Config._getConfig()['api']['key']

    @staticmethod
    def getRequestHeaders():
        return {
            'x-arrow-apikey' : Config.getApiKey()
        }