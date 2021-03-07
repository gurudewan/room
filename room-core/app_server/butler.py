import hashlib
import json
import logging
from datetime import datetime, timedelta

from pprint import pprint

from bson import json_util, ObjectId
from flask import Flask, request, jsonify, redirect, render_template, Blueprint
from urllib import parse

import databaser
import googler
import notifier
from decoration import requiresAuth


import fake_data

logging.getLogger().setLevel(logging.INFO)

butler_server = Blueprint('butler_server', __name__)

"""
    Handles entry, exit, refresh, etc of the room.
"""

# ------------------------------------------ROOM HANDLER-----------------------------------------------#


@butler_server.route("/find-nearby-rooms", methods=["POST"])
@requiresAuth
def serveNearbyRooms(user_id):
    # accept a location
    # find nearby places using Google Places API
    # create a room instance (in the room collection) for each place
    # return a list of the room instances

    params = request.get_json()

    # extract location, and find the nearby rooms from google

    geolocation = params['location']['coords']
    location = str(geolocation['latitude']) + ',' + str(geolocation['longitude'])  # todo location here
    nearby_rooms = googler.getNearbyRooms(location)

    # test room
    # add Test Members
    if str(user_id) in ['5f8de588542409d7bacd36c8', '5f80f945406471ab2e7d7e63', '5f84c830ab5edce748ef6261', '5f97f6da4dd8030744793a1a']: # G01,K0,G@live

        nearby_rooms.append(fake_data.test_room)

    rooms = databaser.addNearbyRooms(nearby_rooms)

    #rooms = fake_data.fake_rooms

    #rooms = databaser.findAllRooms()
    return json_util.dumps({'content': rooms}), 200


@butler_server.route("/enter-room", methods=["POST"])
@requiresAuth
def enterARoom(user_id):
    '''
    '''

    params = request.get_json()
    room_id = params['room_id']

    databaser.enterARoom(user_id, room_id)

    response = {'content': 'success'}

    return json_util.dumps(response), 200


@butler_server.route("/exit-room", methods=["POST"])
@requiresAuth
def exitARoom(user_id):
    '''
    '''

    params = request.get_json()

    room_id = params['room_id']

    databaser.exitARoom(user_id, room_id)

    response = {'content': 'success'}

    return json_util.dumps(response), 200


@butler_server.route("/fetch-the-room", methods=["POST"])
@requiresAuth
def serveTheRoom(member_id):
    '''

    '''

    params = request.get_json()
    room_id = params['room_id']

    # clean up
    cleanUpRoom(room_id)

    # find the room + fetcher
    room = databaser.findARoom(room_id)
    fetcher = databaser.findAMember(member_id)

    # check human is in vicinity of room

    geolocation = params['location']['coords']

    if room['location'] != 'everywhere': 
    # for Founders Club
        if float(room['location']['lat']) - float(geolocation['latitude']) > 0.0003 or float(room['location']['lng']) - float(geolocation['longitude']) > 0.0003:
            # user has espaced the room
            pprint('booted cos too far but not actually')
            # pprint(float(room['location']['lat']))
            # pprint(float(geolocation['latitude']))

            #pprint(float(room['location']['lat']) - float(geolocation['latitude']))
            #pprint(float(room['location']['lng']) - float(geolocation['longitude']))
            # return json_util.dumps({'content': 'booted-from-the-room' }), 205

    members_interactions = None

    if room['members'] != []:
        member = next((x for x in room['members']
                       if x['_id'] == member_id), None)
        if member is None:
            pprint('booted cos too late')
            return json_util.dumps({'content': 'booted-from-the-room'}), 205
        member['last_active'] = datetime.now()

        members_interactions = member['interactions']

    # now, map each interaction to the members
    all_members = room['members']

    # remove self + hidden people from the room
    members = [m for m in all_members if (m['_id'] != member_id and m['_id'] not in fetcher['hidden'])]

    # iterate through all the members of the room
    for m in members:
        # set interaction for app to render

        del m['interactions']
        #del m['hidden']
        del m['last_active']
        #del m['reports']

        receiver_id = m['_id']

        if receiver_id in members_interactions['hisent']:
            m['interaction'] = 'hisent'
        if receiver_id in members_interactions['higot']:
            m['interaction'] = 'higot'
        if receiver_id in members_interactions['hihi']:
            m['interaction'] = 'hihi'

    room['members'] = members

    # delete some extra values
    del room['population']
    del room['pop_time']
    del room['ggl_place_id']

    # serve back

    pprint('----------------------------serving a room----------------------------------')

    return json_util.dumps({'content': room}), 200


@butler_server.route("/interaction", methods=["POST"])
@requiresAuth
def postInteraction(sender_id):
    # accept a room and an interactions state
    pprint('----------------------someone said hi-----------------------------')
    params = request.get_json()

    receiver_id = ObjectId(params['receiver_id'])

    room_id = params['room_id']
    interaction_type = params['interaction_type']

    # find the interactor and receiver
    sender = databaser.findAMember(sender_id)
    receiver = databaser.findAMember(receiver_id)

    # add in the hi
    if interaction_type == 'hi':
        if receiver_id not in sender['interactions']['hisent']:
            sender['interactions']['hisent'].append(receiver_id)
        
        if sender_id not in receiver['interactions']['higot']:
            receiver['interactions']['higot'].append(sender_id)

        if sender_id in receiver['interactions']['hisent'] and receiver_id in sender['interactions']['hisent']:
            # if both said hi to each other  = if both are in each other's hisent = if (sender in receivers hisent) and (receiver in senders hisent)

            sender['interactions']['hisent'].remove(receiver_id)
            receiver['interactions']['hisent'].remove(sender_id)

            sender['interactions']['higot'].remove(receiver_id)
            receiver['interactions']['higot'].remove(sender_id)

            sender['interactions']['hihi'].append(receiver_id)
            receiver['interactions']['hihi'].append(sender_id)
        
        # find the room, and so the list of members
        room = databaser.findARoom(room_id)
        members = room['members']

        room_sender = next(x for x in members if x['_id'] == sender_id)
        room_receiver = next(x for x in members if x['_id'] == receiver_id)

        room_receiver = receiver
        room_sender = sender

        # TODO send notification to receiver
        # 'Sender_Name said hi to you'

        # update in users, AND in the room collection
        databaser.updateUserInfo(sender_id, sender)
        databaser.updateUserInfo(receiver_id, receiver)
        databaser.updateARoomMembers(room_id, members)

    return json_util.dumps({'content': 'success'}), 200


@butler_server.route("/report", methods=["POST"])
@requiresAuth
def reportHuman(sender_id):

    # extract params
    params = request.get_json()

    receiver_id = ObjectId(params['receiver_id'])
    report_code = params['report_code']
    hide_human = params['hide_human']

    if report_code != 'just_hide':
        # find the interactor and receiver
        sender = databaser.findAMember(sender_id)
        receiver = databaser.findAMember(receiver_id)

        databaser.addAReport(receiver_id, report_code)

    # TODO double add bug
    if hide_human:

        logging.info(receiver_id)
        logging.info(params['receiver_id'])
        logging.info(sender['hidden'])

        if receiver_id not in sender['hidden']:
            sender['hidden'].append(receiver_id)
            databaser.updateUserInfo(sender['_id'], sender)

        if sender_id not in receiver['hidden']:
            receiver['hidden'].append(sender_id)
            databaser.updateUserInfo(receiver['_id'], receiver)
        
    return json_util.dumps({'content': 'success'}), 200

def cleanUpRoom(room_id):
    '''
        Boots inactive members who haven't checked out the room in the past 30 minutes.

        Runs each time someone fetches the room.
        ## TODO better to run on a 10-20 minute interval.
        ## ?? Or every 100th request for a fetch of the room. ??
    '''

    # add a state collection
    # incrememnt every time this is called
    # if > 500 or some #, only then do the following::

    room = databaser.findARoom(room_id)

    members = room['members']

    time_now = datetime.now()

    clean_members = []

    for m in members:
        # TODO decide booting period
        if m['last_active'] - time_now < timedelta(minutes=30):
            clean_members.append(m)

    databaser.updateARoomMembers(room['_id'], clean_members)

    return


if __name__ == '__main__':
    pprint('-----butler------')
