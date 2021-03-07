# externally-written modules
import logging
logging.getLogger().setLevel(logging.INFO)
import jwt
from datetime import datetime, timedelta
import hashlib
import json

# self-written modules
from secure_keys import credentials
"""
    Handles creation and verification of JWT tokens.
    Used for authorisation of the app when making requests to the core.
"""

# get the secrets used to encode + decode tokens from credentials
SECRETS = credentials.get("token_secrets")
ENV = credentials.get("environment")

def create_token(data, jwtype):
    # returns a string token
    # accepts params specifying data & the type of token

    data['iss'] = "flow-core"
    data['iat'] = datetime.now()
    data['type'] = jwtype
    data['env'] = ENV

    if (jwtype == 'auth'):
        data['exp'] = datetime.now() + timedelta(days=6) #timedelta(hours = 1)
    elif (jwtype == 'magic'):
        data['exp'] = datetime.now() + timedelta(weeks= 1) # hours
    elif (jwtype == 'access'):
        data['exp'] = datetime.now() + timedelta(minutes= 30)  # (hours = 10)
    elif (jwtype == 'refresh'):
        data['exp'] = datetime.now() + timedelta(days= 7) # 2 days
        # ?does or does not expire?
    
    jwtoken = jwt.encode(data, SECRETS[jwtype], algorithm='HS256')

    token = jwtoken.decode('utf-8') # convert from byte string to utf-8 string

    return token

def decode_token(jwtoken, jwtype):

    if isinstance(jwtoken, str):
        # if the token is in string form we convert it to bytes form
        jwtoken = jwtoken.encode('utf-8')
    
    decoded_token = jwt.decode(jwtoken, SECRETS[jwtype], leeway=10, algorithm='HS256')
    
    return decoded_token

def validate_token(jwtoken, jwtype):
    '''
        Accepts a token, and the expected type = "auth" | "magic" | "access" | "refresh".
        Returns is token valid boolean True | False.
    '''
    try:
        decode_token(jwtoken, jwtype)
        return True
    except jwt.exceptions.ExpiredSignatureError:
        logging.info('Signature expired. Please provide a new token.')
        return False
    except jwt.exceptions.InvalidSignatureError:
        logging.info('Invalid signature. Please provide a new token')
        return False
    except jwt.exceptions.DecodeError:
        logging.info('Decode Error. Please provide a new token')
        return False
    # according to realpython.com, only InvalidTokenError and ExpiredSignatureError need to be checked
    #except jwt.exceptions.InvalidTokenError:
     #   logging.info( 'Invalid token. Please log in again.')
      #  return False

if __name__ == "__main__":

    #test_token = create_token({}, 'auth')

    #str_token = test_token.decode('utf-8')

    #logging.info("The token is " + str_token)
    data = {"_id": "5f8de588542409d7bacd36c8", "user_scope": "complete"}

    token = create_token(data, "magic")
    #logging.info(type(token))
    logging.info(token)

    #decoded = decode_token(token, "auth")
    #logging.info(decoded)
    #logging.info(create_token(data, 'auth'))
    
    #logging.info("-----------------")
    #data["user_scope"] = "complete"
    #logging.info(create_token(data, "auth"))