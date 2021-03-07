import time
import datetime
from pprint import pprint
import uuid
import re
from bson import json_util, ObjectId
import notifier
from urllib import parse

import databaser
import fake_data

import app_server.butler as butler


def populateRoomsFake():
    all_members = databaser.findAllUsers()
    all_rooms = databaser.findAllRooms()

    for room in all_rooms:
        for member in all_members:
            databaser.enterARoom(member['_id'], room)

    return


def populateFoundersClubFake():
    pprint('--populating Founders Club--')

    founders_club_id = ObjectId('5f8aedd7707788943679c5ec')

    query = {'_id': founders_club_id}

    for member in fake_data.fake_members:

        member['interactions'] = {
            'hisent': [],
            'higot': [],
            'hihi':[]
        }

        member['last_active'] = datetime.datetime.now()

        new_room_id = databaser.rooms_collection.update_one(query, {"$push": {"members": member}}).upserted_id



if __name__ == "__main__":
    pprint('------------------playground----------------------')

    new_data = {
        'interactions': {
            'hisent': [],
            'higot': [],
            'hihi':[]
            }
    }

    databaser.addNewFieldToEveryMember(new_data)

    """     all_humans = databaser.findAllUsers()

    #for human in all_humans:
        print(human)
        if 'interactions' in human:
            human['interactions'] = {
            'hisent': [],
            'higot': [],
            'hihi':[]
            }
            databaser.updateUserInfo(human['_id'], human)
            pprint('did update') """
    

    '''
    nina_dewan_id = ObjectId('5f8df4b06ac84f25a5fdbd9f')
    leila_dewan_id = ObjectId('5f8de7336ac84f25a5fdbd9e')

    founders_club_id = ObjectId('5f95580ca0192b5867d9376a')

    databaser.enterARoom(nina_dewan_id, founders_club_id)
    databaser.enterARoom(leila_dewan_id, founders_club_id)

    exiter_id = ObjectId('5f6fa84c3dd0316879b76ca8')
    room_id = ObjectId('5f7b5ac089f651c5bf7623b0')
    query = {'_id': room_id}
    '''
    """     response = databaser.rooms_collection.update_one(
        query,
        {"$pull": {'members': {'_id': exiter_id}}}
    ) 
    pprint(response)

    """


    # databaser.rooms_collection.delete_many({})

"""     unfiltered_rooms = [
        {
            'name': 'Soho House',
            'types': ['establishment']
        },

        {
            'name': 'Wethershpoons',
            'types': ['admin']
        },
        {
            'name': 'Roxy',
            'types': ['establishment', 'point_of_interest']
        }
    ]

    valid_types = set(['establishment', 'point_of_interest', 'airport', 'art_gallery', 'bar', 'bowling_alley',
                       'cafe', 'casino', 'lodging', 'gym', 'library', 'museum', 'night_club', 'park', 'restaurant', 'university'])

    rooms = []
    for room in unfiltered_rooms:
        if set(room['types']) <= valid_types:
            rooms.append(room)
 """
    # pprint(rooms)

'''
    # booter to check if not active for 30 mins
        if member['last_active'] -  time_now > timedelta(seconds=1):
            pprint('booted cos too late')
'''
