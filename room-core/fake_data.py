from bson import ObjectId


from bson import ObjectId


fake_members = [
    {"_id": ObjectId("5f80f945406471ab2e7d7e63"),
    "email_addr": "leila@fake.com",
    "status": "complete",
    "birthday": "1996-12-04T00:00:00.000Z",
    "full_name": "Leila Dewan",
    "member_since": "2020-10-10T00:11:13.113Z", 
    "one_liner": "My hobbies include consuming wine and cheese, and both at the same time. ", 
    "pic_url": "http://room-photographer.s3.amazonaws.com/5f834ac5ecfc71df6dddd939.png", 
    "device_token": "ExponentPushToken[36zDUNEfA1TQHzxzqtIfV0]"}, 
    {"_id": ObjectId("5f80f945406471ab2e7d7e63"), 
    "email_addr": "nina@fake.com", 
    "status": "complete", 
    "birthday": "1996-12-04T00:00:00.000Z", 
    "full_name": "Nina Dewan", 
    "member_since": "2020-10-10T00:11:13.113Z", 
    "one_liner": "Im cool ", 
    "pic_url": "http://room-photographer.s3.amazonaws.com/5f80f945406471ab2e7d7e63.png", 
    "device_token": "ExponentPushToken[36zDUNEfA1TQHzxzqtIfV0]"}
]

test_room = {
    'name': 'Founders Club',
            'geometry': {'location': 'everywhere'},
            'population': 0,
            'pop_time': [{'p': 0, 't': ''}],
            'place_id': 'test-room',
}


userProfiles = [
    {
        'name': 'Gaurav',
        'email_addr': 'gauravdewan@live.com',
        'status': 'complete',
        'age': 22,
        'pics': [{
            'uri': 'https://scontent-lht6-1.xx.fbcdn.net/v/t1.0-9/22853456_914247652055946_8813292947095856368_n.jpg?_nc_cat=105&_nc_sid=09cbfe&_nc_ohc=gB9R5oRWJGcAX9vW8zM&_nc_ht=scontent-lht6-1.xx&oh=89315b654b6955a6632e5e88f2c720db&oe=5F7B4787',
        }],
        'moods': ['']
    },
    {
        'name': 'Karishma',
        'email_addr': 'gauravdewan@live.com',
        'status': 'complete',
        'age': 27,
        'pics': [{
            'uri': 'https://scontent-lhr8-1.xx.fbcdn.net/v/t1.0-9/117983536_3442819515785727_6047814910245425636_o.jpg?_nc_cat=109&_nc_sid=09cbfe&_nc_ohc=JVy06fADGEEAX_ln63-&_nc_oc=AQmxxcEB9DFVPxbZBUoUdD1rSO3tsls6689T6rj82Sv0JbsIytMSqV1PI4V0h2faRuKxrkw2mY8F2LwT2xqib0yr&_nc_ht=scontent-lhr8-1.xx&oh=8d520ead707a68f2da806bc1e7015cb9&oe=5F7D2C15',
        }],
        'moods': ['']
    },

]


fake_rooms = [{
    "_id": {
        "$oid": "5f84cd5109a783ce009d8bd3"
    },
    "name": "Pitch Marketing Group",
    "location": {
        "lat": 51.5117683,
        "lng": -0.1349315
    },
    "population": 0,
    "pop_time": [
        {
            "p": 0,
            "t": {
                "$date": "2020-10-12T21:40:33.006Z"
            }
        }
    ],
    "members": [],
    "ggl_place_id": "ChIJxfVGhtMEdkgRcUVT2vTKpAM"
}, {
    "_id": {
        "$oid": "5f84cd5109a783ce009d8bd4"
    },
    "name": "End of Tenancy Cleaning Soho",
    "location": {
        "lat": 51.5119365,
        "lng": -0.1350614
    },
    "population": 0,
    "pop_time": [
        {
            "p": 0,
            "t": {
                "$date": "2020-10-12T21:40:33.034Z"
            }
        }
    ],
    "members": [],
    "ggl_place_id": "ChIJ3ZTTdToFdkgRHnMQK6A9ck4"
}, {
    "_id": {
        "$oid": "5f84cda709a783ce009d8bd5"
    },
    "name": "The Pavement Studios",
    "location": {
        "lat": 51.5117884,
        "lng": -0.1352762
    },
    "population": 0,
    "pop_time": [
        {
            "p": 0,
            "t": {
                "$date": "2020-10-12T21:41:59.132Z"
            }
        }
    ],
    "members": [],
    "ggl_place_id": "ChIJp0jQeNQEdkgReJL_RQTITxs"
}, {
    "_id": {
        "$oid": "5f84cda709a783ce009d8bd8"
    },
    "name": "Gate Television Productions Ltd",
    "location": {
        "lat": 51.5119403,
        "lng": -0.1352178
    },
    "population": 0,
    "pop_time": [
        {
            "p": 0,
            "t": {
                "$date": "2020-10-12T21:41:59.216Z"
            }
        }
    ],
    "members": [],
    "ggl_place_id": "ChIJx1DQeNQEdkgRSEZsnwukESo"
}, {
    "_id": {
        "$oid": "5f84cda709a783ce009d8bd9"
    },
    "name": "Goldcrest Studio",
    "location": {
        "lat": 51.5119403,
        "lng": -0.1352178
    },
    "population": 0,
    "pop_time": [
        {
            "p": 0,
            "t": {
                "$date": "2020-10-12T21:41:59.260Z"
            }
        }
    ],
    "members": [],
    "ggl_place_id": "ChIJDfUZedQEdkgRI_5TPjvrsyM"
}, {
    "_id": {
        "$oid": "5f84cda709a783ce009d8bda"
    },
    "name": "Slumber Film Limited",
    "location": {
        "lat": 51.5119403,
        "lng": -0.1352178
    },
    "population": 0,
    "pop_time": [
        {
            "p": 0,
            "t": {
                "$date": "2020-10-12T21:41:59.313Z"
            }
        }
    ],
    "members": [],
    "ggl_place_id": "ChIJx1DQeNQEdkgRAprgvR7huX0"
}]
