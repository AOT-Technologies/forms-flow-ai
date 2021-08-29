from ..models.sentiment_results import SentimentResults

def save_sentiment_result(input_request, output_response):
    SentimentResults(input_request=input_request, output_response=output_response).save()
    # SentimentResults.create_result_dict(input_request, output_request)
