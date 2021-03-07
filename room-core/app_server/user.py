import hashlib
import json
import logging
import datetime
import os
from werkzeug import secure_filename

from bson import json_util, ObjectId
from flask import Flask, request, jsonify, redirect, render_template, Blueprint
from urllib import parse

from pprint import pprint

import databaser
from decoration import requiresAuth
import awsuploader

logging.getLogger().setLevel(logging.INFO)

user_server = Blueprint('user_server', __name__)

'''
    Handles the user-info, payment-info services.
'''

# ------------------------------------------USER INFO-----------------------------------------------#


@user_server.route('/user/my-profile', methods=['POST'])
@requiresAuth
def updateUserProfile(user_id):
    # accept a profile update, or a profile create

    request_data = request.get_json()
    
    new_profile = {}

    if 'one_liner' in request_data:
        new_profile['one_liner'] = request_data['one_liner']

    if 'base64' in request_data:        
        # upload to aws + get a url for it
        img_base64 = request_data['base64']
        pic_url = awsuploader.uploadImage(img_base64, str(user_id))
        new_profile['pic_url'] = pic_url

    if 'birthday' in request_data and 'full_name' in request_data:
        new_profile['birthday'] = request_data['birthday']
        new_profile['full_name'] = request_data['full_name']
        
    databaser.updateUserInfo(user_id, new_profile)

    response = {'content': 'success'}

    return json_util.dumps(response), 200


@user_server.route('/user/my-info', methods=['GET'])
@requiresAuth
def serveUserInfo(user_id):
    '''
        Accepts a user_id.
        Returns the related user_info.
    '''
    response = {}

    user_info = databaser.findAMember(user_id)
    logging.info('The returned user is' + str(user_info))

    if user_info is None:
        response['content'] = 'no-such-user'
        return json_util.dumps(response), 501

    if user_info is False:
        response['content'] = 'databaser-server-error'
        return json_util.dumps(response), 501

    response['content'] = user_info

    return json_util.dumps(response), 200
    
# --------------------------------------NOTIFICATIONS-----------------------------------------#

@user_server.route('/user/auth/notifications', methods=['POST'])
@requiresAuth
def signUpDeviceForNotifications(user_id):
    request_data = request.get_json()
    device_token = request_data['device_token']

    # something is going wrong here...
    logging.info('-------------------------')
    logging.info(user_id)
    logging.info(request_data)
    logging.info(device_token)
    logging.info('-------------------------')

    databaser.updateUserInfo(user_id, {'device_token': device_token})

    response = {}

    return json_util.dumps(response), 200
        
if __name__ == '__main__':
    logging.info('User Server Testing')