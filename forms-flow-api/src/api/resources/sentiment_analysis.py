from flask_pymongo import PyMongo

from ..schemas import Database
from ..services.sentiment_analysis import pipeline


API = Namespace('sentiment', description='API endpoint for sentiment analysis')

@API.route('/', methods=['POST'])
def form_api():
    # API for response inference
    parsejson = request.get_json()
    text = parsejson["text"]
    response = pipeline(text=text)
    output_response = jsonify(response)
    
    # what I was think was isn't this api similar to the api I created for topic sentiment model
    # that api took request as input POST text passed
    # returns the output response 
    # then store the result in this endpoint
    post_data = {input: text, output: output_response}
    schema = Database.create(post_data)
    return 'MONGO db data was entered'