from fake_data import userProfiles
from decoration import safeDatabaser
from secure_keys import credentials
from bson import json_util, ObjectId
from pprint import pprint
import pymongo
import hashlib
import logging
import datetime
import time

logging.getLogger().setLevel(logging.INFO)


# from fake_assets import assets
# from data_source import assets_test_data, users_test_data, new_asset_data

environment = credentials.get("environment")
connString = credentials.get("mongoConnString")[environment]
GOOGLE_API_KEY = credentials.get('GOOGLE_API_KEY')


# init mongo
client = pymongo.MongoClient(connString)
DB = client.room_db  # DB is the main database

users_collection = DB.users_collection  # flow client user info

rooms_collection = DB.rooms_collection

state = DB.state

# --------------------------------------------USER------------------------------------------------#


@safeDatabaser
def incrementState(new_state):

    # state.update_one({'num_times_room_fetched': }: )

    return

# --------------------------------------------USER------------------------------------------------#


@safeDatabaser
def partiallyAddNewUser(email_addr):
    """
        Accepts an email_addr of a partially added user.
        Adds the user as a partial user into the users_collection.
    """
    # accept email address
    # stores email in a 'partially complete' user doc
    # this is the sign up phase (pre-magic link)

    partialUserData = {"email_addr": email_addr, "status": "partial"}

    _id = users_collection.insert_one(partialUserData).inserted_id

    return _id


@safeDatabaser
def completelyAddNewUser(_id, new_data):
    """
        Takes an _id of a user, and the new_data = {"full_name": ""}.
        Adds this additional data into the right user entry.
        Thereby completing the sign-up process.
    """
    _id = ObjectId(_id)

    new_data["status"] = "complete"

    _id = updateUserInfo(_id, new_data)

    #_id = users_collection.update_one({"_id": _id}, {"$set": new_data}).upserted_id

    return _id


@safeDatabaser
def updateUserInfo(_id, new_data):
    """
        General update to a user.
    """
    _id = ObjectId(_id)

    _id = users_collection.update_one(
        {"_id": _id}, {"$set": new_data}).upserted_id

    return _id


@safeDatabaser
def findUserStatus(email_addr):
    """
        Accepts an email address.
        Returns the type of the user: "complete" | "partial" | "new".
    """

    user = users_collection.find_one({"email_addr": email_addr})

    if user is None:
        return "new"

    return user["status"]


@safeDatabaser
def findAMember(_id):
    # accepts the ID (in str or ObjID form)
    # gets the user info and returns

    _id = ObjectId(_id)

    user = users_collection.find_one({"_id": _id})

    return user


@safeDatabaser
def findUserID(email_addr):
    """
        Accepts an email_addr.
        Finds and returns the related user_id.
    """
    user = users_collection.find_one({"email_addr": email_addr})
    return str(user["_id"])


@safeDatabaser
def findDeviceTokens(owners):
    """
        Accepts an array of owner_ids.
        Finds and returns the related device_tokens.
    """

    device_tokens = []

    for owner_id in owners:
        device_token = findSingleDeviceToken(owner_id)
        if device_token is not None:
            device_tokens.append(device_token)

    return device_tokens


@safeDatabaser
def findSingleDeviceToken(owner_id):
    """
        Accepts a user/owner_id.
        Finds and returns the related device_token.
    """
    user = users_collection.find_one({"_id": owner_id})

    return user["device_token"]


@safeDatabaser
def addAReport(reported_id, report_code):
    """
        Adds 1 to the # of times the user has been reported.
    """
    reported_id = ObjectId(reported_id)

    users_collection.update_one(
        {'_id': reported_id}, {'$inc': {f'reports.{report_code}': 1}})

    return

# ------------------------------------ROOM ENTER + EXIT--------------------------------#


@safeDatabaser
def enterARoom(user_id, room_id):
    """

    """

    user_id = ObjectId(user_id)
    room_id = ObjectId(room_id)

    query = {'_id': room_id}

    existing_room = rooms_collection.find_one(query)

    if existing_room is None:
        logging.error("Couldn't find the room")
        return False

    # make an array of the ids of the members in this room
    room_members_ids = [x['_id'] for x in existing_room['members']]

    if user_id in room_members_ids:
        logging.error("User attempted to enter a room they're already in")
        return existing_room['_id']  # TODO correct status code

    elif user_id not in room_members_ids:
        logging.info(f"User {user_id} entered room {existing_room['_id']}")
        # get the full info for the member
        member = findAMember(user_id)

        # delete unnecessary info
        del member['email_addr']
        del member['member_since']
        del member['status']
        del member['hidden']
        del member['reports']

        if 'device_token' in member:
            del member['device_token']
        
        member['last_active'] = datetime.datetime.now()

        new_room_id = rooms_collection.update_one(
            query, {"$push": {"members": member}}).upserted_id

        # add an interactions thing for each member for this X
        # update the interactions of each existing member A, B, C to include X
        # ? not needed, default intreactioni.e. no intractionis omitted

        return new_room_id


@safeDatabaser
def exitARoom(user_id, room_id):
    """
    """

    user_id = ObjectId(user_id)
    room_id = ObjectId(room_id)

    query = {'_id': room_id}

    existing_room = rooms_collection.find_one(query)

    if existing_room is None:
        logging.info("Couldn't find the room")
        return False

    room_members_ids = [x['_id'] for x in existing_room['members']]

    if user_id not in room_members_ids:
        logging.info("User attempted to exit a room they're not in")
        return False

    else:
        # TODO: remove this exiter from the 'interactions' of every other member of the room
        # -> or persist interactions somehow for a while?

        rooms_collection.update_one(
            query, {"$pull": {'members': {'_id': user_id}}})

        logging.info(f"User {user_id} exited room {room_id}")

        return True


@safeDatabaser
def createNewRoom(room_data):
    rooms_collection.insert_one(room_data)


@safeDatabaser
def addNearbyRooms(nearby_ggl_rooms):

    rooms = []

    for raw_ggl_room in nearby_ggl_rooms:

        room = addNearbyRoom(raw_ggl_room)
        rooms.append(room)

    return rooms


def addNearbyRoom(room_data):

    query = {
        'ggl_place_id': room_data['place_id']
    }

    existing_room = rooms_collection.find_one(query)

    if existing_room is None:

        room = {
            'name': room_data['name'],
            'location': room_data["geometry"]["location"],

            'population': 0,
            'pop_time': [{'p': 0, 't': datetime.datetime.now()}],

            'members': [],

            'ggl_place_id': room_data['place_id'],
        }

        # add photo if it's there
        if 'photos' in room_data and room_data['photos'] != []:
            ggl_photo_ref = room_data['photos'][0]['photo_reference']
            ggl_photo_uri = f'https://maps.googleapis.com/maps/api/place/photo?photoreference={ggl_photo_ref}&sensor=false&maxheight=300&maxwidth=400&key={GOOGLE_API_KEY}'
            room['ggl_photo_uri'] = ggl_photo_uri

        new_room_id = rooms_collection.insert_one(room).inserted_id

        room['_id'] = new_room_id

        return room

    elif existing_room is not None:

        return existing_room


def updateARoomMembers(room_id, members):

    room_id = ObjectId(room_id)
    query = {'_id': room_id}

    rooms_collection.update_one(query, {"$set": {"members": members}})

    #logging.info(f"User {user_id} exited room {existing_room['_id']}")

    return True


# ------------------------------------ROOM FIND--------------------------------#
@safeDatabaser
def findARoom(room_id):

    room_id = ObjectId(room_id)

    room = rooms_collection.find_one({"_id": room_id})

    return room

# ----------------------------------------DB HELPERS-------------------------------------------#


def makePretty(cursor):
    """ 
        Accepts a cursor from mongoDB.
        Converts the _id of each documment in the cursor from ObjectID into a string.
        Returns new list form.
    """
    # ?does it need to convert EACH instance of ObjectID into string form?
    # ? or just THE ID of each doc into string form?
    # TODO: above
    data = list(cursor)
    for entry in data:
        entry["_id"] = str(entry["_id"])
    return data


def addNewFieldToEveryMember(new_data):
    users_collection.update_many(
        {},
        {'$set': new_data},
        upsert=False,  # upsert
        array_filters=None
    )


# ----------------------------------------TEST--------------------------------------------------#

@safeDatabaser
def findAllRooms():
    # searches through rooms for ALL users
    all_rooms = rooms_collection.find({})
    pprint(list(all_rooms))
    return list(all_rooms)


@safeDatabaser
def findAllUsers():
    # searches through users_DB for ALL users
    # returns ALL users
    all_users = users_collection.find({})
    pprint(list(all_users))
    return list(all_users)


if __name__ == "__main__":

    print("======================== databaser ========================")
    findAllRooms()
