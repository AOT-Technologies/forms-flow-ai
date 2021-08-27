from ..models.sentiment_results import SentimentResults

def save_sentiment_result(input_request, output_request):
    SentimentResults(input_request=input_request, output_request=output_request).save()
    # SentimentResults.create_result_dict(input_request, output_request)
