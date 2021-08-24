from ..models.sentiment_results import SentimentResults

def sentiment_result(input_request, output_request):
    SentimentResults.create_result_dict(input_request, output_request)
