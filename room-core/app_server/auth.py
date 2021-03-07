import json
import logging
import datetime

from bson import json_util
from flask import Flask, request, jsonify, redirect, render_template, Blueprint

import databaser, postman, tokeniser
from decoration import requiresAuth
from secure_keys import credentials
logging.getLogger().setLevel(logging.INFO)

import awsuploader

# get APP_URL
environment = credentials.get('environment')

APP_URL = credentials.get('APP_URL')[environment]

auth_server = Blueprint('auth_server', __name__)

'''
    Handles all authorisation: tokens, magic, log-in, sign-up.

'''

# ------------------------------------------TOKENS SERVING-----------------------------------------------#

@auth_server.route('/user/tokens', methods=['GET'])

def serveNewTokens():
    '''
        Accepts a refresh_token.
        If it is valid, serves new tokens = {access, auth, refresh}
    '''

    refresh_token = request.headers['token']
    response = {}

    if not tokeniser.validate_token(refresh_token, 'refresh'):
        response['content'] = 'invalid-refresh-token'
        return json_util.dumps(response), 401

    data = tokeniser.decode_token(refresh_token, 'refresh')
    
    auth_token = tokeniser.create_token(data, 'auth')
    access_token = tokeniser.create_token(data, 'access')
    refresh_token = tokeniser.create_token(data, 'refresh')

    tokens = {
        'auth_token': auth_token,
        'access_token': access_token,
        'refresh_token': refresh_token,
    }

    response['content'] = tokens

    return json_util.dumps(response), 200

# ------------------------------------------SIGN UP & LOG IN-----------------------------------------------#
''' 
    Implementation of OAuth2.
'''

@auth_server.route('/user/auth/magic-email', methods=['POST'])
def sendMagicEmail():
    '''
        Accepts an email address.
        Finds the user_status: complete | partial | new.
        Creates a magic_token, and sends the magic link to the email address.
    '''
    request_data = request.get_json()

    email_addr = request_data['email_addr']
    response = {}
    _id = None
    data = {}

    user_status = databaser.findUserStatus(email_addr)
    
    # catch db errors
    if user_status is False:
        response['content'] = 'find-user-error'
        return json_util.dumps(response), 501
    
    # check user statuses
    if user_status == 'complete':
        _id = str(databaser.findUserID(email_addr))
        data = {'_id': _id, 'user_scope': 'complete'}

    elif user_status == 'partial':
        _id = str(databaser.findUserID(email_addr))
        data = {'_id': _id, 'user_scope': 'partial'}

    elif user_status == 'new':
        _id = str(databaser.partiallyAddNewUser(email_addr))
        data = {'_id': _id, 'user_scope': 'partial'}

    magic_token = tokeniser.create_token(data, 'magic')
    sent_email = postman.send_magic_link(email_addr, magic_token)    

    if sent_email is False:
        response['content'] = 'email-send-failure'
        return json_util.dumps(response), 501
        
    response['content'] = 'sent-email'

    return json_util.dumps(response), 200

@auth_server.route('/user/auth/magic-token/', methods=['GET'])
def authoriseMagicToken():
    '''
        Accepts a magic_token, as sent by the client when the user opens the magic link
        The magic_token can be login or signup.
        Returns an auth_token (which will be either complete = login or partial = signup).
    '''
    logging.info('MAGIC TOKEN RECEIVED ---- 1A')

    magic_token = request.headers.get('token')
    logging.info('the json request is')
    #logging.info(request.get_json())

    #magic_token = request.get_json()['token']

    logging.info(magic_token)
    logging.info('-------------------------------')
    auth_token = None
    response = {}

    if not tokeniser.validate_token(magic_token, 'magic'):
        response['code'] = 'FAILURE'
        response['content'] = 'invalid-magic-token'
        logging.info('POINT OF FAIL ---- 1B')

        return json_util.dumps(response), 401   

    logging.info('POINT ----1C')
    data = tokeniser.decode_token(magic_token, 'magic')
    auth_token = tokeniser.create_token(data, 'auth')

    logging.info('The scope of the magic_token was: ')
    logging.info(data['user_scope'])
    # note: data['user_scope'] encodes whether it is partial auth or complete auth
    # so this state is preserved from magic to auth token

    response['content'] = {'auth_token': auth_token}
    return json_util.dumps(response), 200


# ------------------------------------------SIGN UP PROCESS-----------------------------------------------#

@auth_server.route('/user/auth/sign-up', methods=['POST'])
def signUpUser():
    '''
        Accepts an auth_token with user_scope = 'partial'.
        Accepts the new_data:= {full_name, member_since}.
        Adds the new_data to the user entry in the database.
        Returns tokens = {auth, access, refresh}, where auth_token now has user_scope = 'complete'.
    '''
    response = {}

    auth_token = request.headers['token']

    if not tokeniser.validate_token(auth_token, 'auth'):
        response['code'] = 'FAILURE'
        response['content'] = 'invalid-auth-token'
        return json_util.dumps(response), 401

    data = tokeniser.decode_token(auth_token, 'auth')
    _id = data['_id']

    # acc start to sign up the user
    request_data = request.get_json()

    img_base64 = request_data['base64']
    # upload to aws + get a url for it
    pic_url = awsuploader.uploadImage(img_base64, str(_id))
    
    new_profile = {
        'full_name': request_data['full_name'],
        'birthday': request_data['birthday'],

        'pic_url': pic_url,
        'one_liner': request_data['one_liner'],

        'interactions': {
            'hisent': [],
            'higot': [],
            'hihi':[]
        },

        'member_since': datetime.datetime.now(),
        'status': 'complete',
        'reports': {
            'fake_profile' : 0,
            'inappropriate_profile' : 0,
            'underage_profile' : 0,
            'bad_behaviour' : 0,
        },
        'hidden': []
    }

    databaser.completelyAddNewUser(_id, new_profile)

    data['user_scope'] = 'complete'

    auth_token = tokeniser.create_token(data, 'auth')
    
    tokens = {
        'auth_token': auth_token,
    }

    response['content'] = tokens

    return json_util.dumps(response), 200


# ------------------------------------------AUTHORISATION-----------------------------------------------#

@auth_server.route('/user/authorise-me', methods=['GET'])
def authoriseUserAuthToken():
    '''
        Accepts an auth_token (complete | partial).
        Checks the validity of the auth_token.
        Responds with the authorisation state (authorised | partially-authorised | unauthorised)
    '''
    logging.info('AUTHING SOMEONE IN AUTHORISE-ME 2A')
    auth_token = request.headers['token']
    logging.info(auth_token)

    response = {}

    if not tokeniser.validate_token(auth_token, 'auth'):
        response['content'] = {'auth_status': 'unauthorised'}
        logging.info('POINT OF FAILURE----- token not valid --- 2B')
        return json_util.dumps(response), 401
    logging.info('--------GOT A VALID AUTH TOKEN ---- 2C')
    data = tokeniser.decode_token(auth_token, 'auth')

    access_token = tokeniser.create_token(data, 'access')
    refresh_token = tokeniser.create_token(data, 'refresh')
    auth_token = tokeniser.create_token(data, 'auth')

    tokens = {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'auth_token': auth_token,
        }

    auth_status = ''
    # TODO ----------------------------
    # change data type around so that
    # auth_status = data['user_scope'] works
    # instead of these if statements:::
    # TODO ----------------------------
    if data['user_scope'] == 'complete':

        auth_status = 'completely-authorised'
        logging.info('And the scope is complete.')

    elif data['user_scope'] == 'partial':
        auth_status = 'partially-authorised'
        logging.info('And the scope is partial.')
    
    response['content'] = {
            'auth_status': auth_status,
            'tokens': tokens,
            }

    return json_util.dumps(response), 200

# --------------------------------------MAGIC LINK REDIRECT----------------------------------------#

@auth_server.route('/magic-link/<magic_token>', methods=['GET'])

def redirectUser(magic_token):
    response = {}

    if not tokeniser.validate_token(magic_token, 'magic'):
        response['content'] = 'invalid-magic-token'
        return json_util.dumps(response), 401

    return render_template('redirect-to-room.html', magic_token=magic_token, APP_URL=APP_URL )

if __name__ == '__main__':
    logging.info('Auth Server Testing')