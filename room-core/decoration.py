from flask import request
import logging
from functools import wraps
from bson import ObjectId, json_util
import pymongo

import tokeniser

def requiresAuth(f):
    # checks if the given access_token is valid
    # only then, f will be computed
    # otherwise, rejects client request

    # TODO catch decode token errors
    
    @wraps(f)
    def decorated(*args, **kwargs):
        access_token = request.headers['token']
        #logging.info(access_token)
        if not tokeniser.validate_token(access_token, "access"):
            # then the access_token is unauthorised
            logging.info("Unauthorised access_token was provided.")
            # statusMessage?
            response = {}
            response['code'] = "UNAUTHORISED"
            response['content'] = "invalid-access-token" 
            return json_util.dumps(response), 401
        else: # AUTHORISED
            data = tokeniser.decode_token(access_token, "access")
            user_id = ObjectId(data['_id'])
            return f(user_id)
    return decorated


def safeDatabaser(f):
    """
        Wraps around all databaser functions.
        Catches pymongo errors.
    """
    @wraps(f)

    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except pymongo.errors.PyMongoError as e:
            logging.error("A pymongo error occured:")
            logging.error(e)
            return False
    
    return decorated


def safeServer(f):
    """
        Wraps around all server functions.
        Catches all errors. Returns 400.
    """
    @wraps(f)

    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logging.error("A server error occured:")
            logging.error(e)
            # json_util.dumps a response etc....
            return False
    
    return decorated