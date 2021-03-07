import logging
from flask import Flask, request, jsonify, redirect, render_template
import pprint
from bson import json_util
logging.getLogger().setLevel(logging.INFO)

# ---------------------------------------FLASK APP SETUP-------------------------------------------#

app = Flask(__name__)

# ---------------------------------------APP SERVER-------------------------------------------#
from app_server.auth import auth_server
from app_server.user import user_server
from app_server.butler import butler_server

app.register_blueprint(auth_server, url_prefix='/app') # tokens, log-in, sign-up, magic
app.register_blueprint(user_server, url_prefix='/app') # user-info + profile
app.register_blueprint(butler_server, url_prefix='/app') # room handling (enter, exit)

# ----------------------------------------STATUS CHECK----------------------------------------------#

@app.route("/", methods=["GET"])
def statusCheck():
    '''
        Status check for the whole server.
    '''
    return "Room core is online."

@app.route("/favicon.ico", methods=["GET"])
def favIcon():
    '''
        Status check for the whole server.
    '''
    return json_util.dumps({'content': "HELLO FAVICON." }), 200

    
# ----------------------------------------MAIN----------------------------------------------#
if __name__ == "__main__":
    logging.info("------------------SERVER IS RUNNING------------------")
    app.run(host="localhost")
    #app.run(debug=True, host="localhost")