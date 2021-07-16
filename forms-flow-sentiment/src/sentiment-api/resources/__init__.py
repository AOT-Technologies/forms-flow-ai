from flask_restx import Api

sentiment_api = Api(
    version='1.0',
    title='Sentiment-API',
    description='API endpoint for sentiment analysis component'
)

sentiment_api.add_namespace(sentiment_namespace, path='/sentiment')
