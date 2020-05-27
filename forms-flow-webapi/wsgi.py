from flask import Flask
from app.main import create_app

application = create_app('dev')

if __name__ == "__main__":
    application.run()
  