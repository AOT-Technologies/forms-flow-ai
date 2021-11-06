## formsflow.ai Sentiment Analysis Job

![Python](https://img.shields.io/badge/python-3.8-blue) ![Flask](https://img.shields.io/badge/Flask-2.0.1-blue) ![postgres](https://img.shields.io/badge/postgres-11.0-blue)

### About Sentiment Analysis model
Please [see](../../forms-flow-data-analysis-api/README.md) for details on sentiment analysis.

## Job
Sentiment analysis job runs as a CRON job to analyze data for overall sentiment and stores the result to table.
Below are the key configuration values to point the analysis to correct data;
- DATABASE_TABLE_NAME : Table where input data for analysis is stored.
- DATABASE_INPUT_COLUMN : Column name where the data analysis text is stored.
- DATABASE_OUTPUT_COLUMN : Column name where the overall analysis result needs to be stored.

## Development Setup

1. Open the jobs/sentiment-analysis directory in VS Code to treat it as a project (or WSL project). To prevent version clashes, set up a
virtual environment to install the Python packages used by this project.
2. Run `make setup` to set up the virtual environment and install libraries.

You also need to set up the variables used for environment-specific settings:
1. Copy the [dotenv template file](.env.template) to somewhere above the source code and rename to `.env`. You will need to fill in missing values.

