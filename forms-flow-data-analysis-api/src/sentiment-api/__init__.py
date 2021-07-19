from flask import Flask

## create flask app
def create_app():
    app = Flask(__name__)
    app.config.from_object('config')