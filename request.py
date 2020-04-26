import binascii
from config import Config
import datetime
from hashlib import sha256
import hmac
import json
import requests
from urllib import parse

class Request:
  @staticmethod
  def create(method, url, queryStringDict = {}, payload = None):
    uri = parse.urlparse(url).path
    headers = Request._getRequestHeaders(method, uri, queryStringDict, payload)
    ret = requests.request(method.upper(), url, params = queryStringDict, headers = headers, json = payload)
    if not ret:
        print(ret)
        return None
    return ret.json()

  # Calculations pulled from https://developer.konexios.io/docs/api-request-signing
  @staticmethod
  def _calculateSignature(method, uri, queryStringDict = {}, dateStr = (datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'), payload = ""):
    # Create our combined query string
    queryStringStr = "\n".join([key.lower()+"="+str(value) for key, value in sorted(queryStringDict.items())])

    # Ensure the payload is flattened out to JSON if necessary
    if (isinstance(payload, dict)):
      payload = json.dumps(payload)

    payloadHexHash = sha256(payload if payload else ''.encode('utf-8')).hexdigest()
    #print(f"Payload Hash: {payloadHexHash}")

    # Assemble our canonical request
    canonicalRequest = "{}\n{}\n{}\n{}".format(method.upper(), uri, queryStringStr, payloadHexHash)
    #print(f"Canonical Request: {canonicalRequest}")

    # Hash the request
    hashRequest = sha256(canonicalRequest.encode('utf-8')).hexdigest()
    #print(f"Hash Request: {hashRequest}")

    # Create the signing string
    signingString = "{}\n{}\n{}\n{}".format(hashRequest, Config.getApiKey(), dateStr, Config.getApiVersion())
    #print(f"Signing String: {signingString}")

    # Create the signing key
    signingKey = Config.getSecretKey().encode('utf-8')
    signingKey = hmac.new(Config.getApiKey().encode('utf-8'), signingKey, digestmod=sha256).digest()
    signingKey = hmac.new(dateStr.encode('utf-8'), signingKey, digestmod=sha256).digest()
    signingKey = hmac.new(str(Config.getApiVersion()).encode('utf-8'), signingKey, digestmod=sha256).hexdigest()
    #print(f"Signing Key: {signingKey}")

    # Create the signature
    signature = hmac.new(signingKey.encode('utf-8'), signingString.encode('utf-8'), digestmod=sha256).hexdigest()
    #print(f"Signature: {signature}")

    return signature

  @staticmethod
  def _getRequestHeaders(method, uri, queryStringDict = {}, payload = None):
    dateStr = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    return {
      'x-arrow-apikey' : Config.getApiKey(),
      'x-arrow-version' : str(Config.getApiVersion()),
      'x-arrow-date' : dateStr,
      'x-arrow-signature' : Request._calculateSignature(method, uri, queryStringDict, dateStr, payload)
    }