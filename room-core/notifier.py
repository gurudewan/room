from exponent_server_sdk import PushClient, PushMessage
from exponent_server_sdk import PushResponseError
from exponent_server_sdk import PushServerError
from requests.exceptions import ConnectionError
from requests.exceptions import HTTPError
from exponent_server_sdk import DeviceNotRegisteredError
import databaser

from bson import json_util, ObjectId


import logging
logging.getLogger().setLevel(logging.INFO)

"""
    Sends notifications.
"""

#----------------------------------------------------------------------BASE SEND NOTIFS-----------------------------------------------------------------------------#

def notify_users(message, device_tokens):
    for token in device_tokens:
        send_notification(token, message)
    return

def send_notification(token, message, extra=None):
    try:
        response = PushClient().publish(PushMessage(to=token, body=message, data=extra))
    except PushServerError as exc:
        # Encountered some likely formatting/validation error.
        #logging.info()
        logging.info(str(exc))
        raise
    except (ConnectionError, HTTPError) as exc:
        # Encountered some Connection or HTTP error - retry a few times in
        # case it is transient.
        #logging.info()
        #raise self.retry(exc=exc)
        logging.info(str(exc))

        raise

    try:
        # We got a response back, but we don't know whether it's an error yet.
        # This call raises errors so we can handle them with normal exception
        # flows.
        response.validate_response()

    except DeviceNotRegisteredError:
        logging.info("Invalid Device Token Provided")
        # TODO disable the token
        # Mark the push token as inactive
        #from notifications.models import PushToken
            #PushToken.objects.filter(token=token).update(active=False)
    except PushResponseError as exc:
        # Encountered some other per-notification error.    
        #logging.info()
        #raise self.retry(exc=exc)
        raise

#----------------------------------------------------------------------TYPES OF NOTIFS-----------------------------------------------------------------------------#

def sendHiGotNotification(receiver_id):
    
    #device_tokens = databaser.findDeviceTokens(transaction['owners']) 
    device_token = databaser.findSingleDeviceToken(receiver_id)

    notification_message = 'Someone waved at you'

    send_notification(notification_message, device_token)

    return

#----------------------------------------------------------------------MAIN-----------------------------------------------------------------------------#

if __name__ == '__main__':

    transaction = {
        'total_value': "£105.00", # TODO format the money intro string
        'merchant': {'name': 'The Coffee Cup'},
        'num_of_items': 10,
        'owners': [ObjectId('5ea181178d4c1c4b14085293')]
    }

    #sendTransactionNotification(transaction)
    token = 'ExponentPushToken[g7OGs5O7Lgt7EZKJoWvmC9]'
    
    notify_users('Hi cool', ['ExponentPushToken[36zDUNEfA1TQHzxzqtIfV0]'])