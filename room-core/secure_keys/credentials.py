import json
import os
import logging
import ast

def get_SERVER(key):
        # TODO either implement or delete this
        '''
        '''

        value = os.environ.get(key)

        return value

def get_LOCAL(key):
        '''
                Opens the keys.txt file and returns requested key.
                Keep keys in the root directory of the project.
        '''

        with open('keys.txt', 'r') as f:
                data = json.load(f)
        
        return data.get(key, None)

def get(key):
        return get_LOCAL(key)
        '''
        if 'SERVERTYPE' in os.environ and os.environ['SERVERTYPE'] == 'AWS Lambda':
                return get_LOCAL(key) # TODO change to get_SERVER()
        else:
                return get_LOCAL(key)
        '''

if __name__ == "__main__":

        environment = get("environment")

        APP_URL = get("APP_URL")[environment]
        CORE_URL = get("CORE_URL")[environment]

        print(APP_URL)
        env = get('environment')
        print(get('environment'))
        print(get('APP_URL')[env])