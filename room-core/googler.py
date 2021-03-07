import requests
from requests.exceptions import HTTPError
from pprint import pprint

from secure_keys import credentials

GOOGLE_API_KEY = credentials.get('GOOGLE_API_KEY')

'''
    Handles the Google Places API
'''


def getNearbyRooms(location):

    rooms = []
    response = {}

    # initial fetch
    response = makeNearbyRoomsRequest(location)
    rooms += response['results']

    # also fetch and store paginated results
    while 'next_page_token' in response:
        if 'next_page_token' is not None:
            rooms += response['results']
            response = makeNearbyRoomsRequest(location, True, response['next_page_token'])
    
    pprint(rooms)

    rooms = filterRooms(rooms)

    return rooms

def makeNearbyRoomsRequest(location, doing_next_page = False, next_page_token = None,):

    url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'

    if not doing_next_page:
        params = {
            'key': GOOGLE_API_KEY,
            'location': location, #'51.541678, -0.125283', #'52.293005, -1.536469', #location, #'51.513948,-0.133091',
            'radius': '15',
        }

    else:
        params = {
            'next_page_token': next_page_token
        }

    try:
        response = requests.get(url, params)
        response.raise_for_status()

    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')
    except Exception as err:
        print(f'Other error occurred: {err}')
    else:
        pprint('got these results beaut:')
        #pprint(response.json())

    rooms = response.json()

    return rooms

def filterRooms(unfiltered_rooms):
    # filter out any rooms that aren't of the correct type

    valid_types = set(['establishment','point_of_interest','airport','art_gallery','bar','bowling_alley','cafe','casino','lodging','gym','library','museum','night_club','park','restaurant','university'])

    rooms  = []

    for room in unfiltered_rooms:

        if set(room['types']) <= valid_types:
            rooms.append(room)

    return rooms

# ------------------------------------------MAIN-----------------------------------------------#

if __name__ == '__main__':
    pprint('-----butler------')