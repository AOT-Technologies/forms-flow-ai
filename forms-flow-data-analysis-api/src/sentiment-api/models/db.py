"""Create SQLAlchenmy and Schema managers.
These will get initialized by the application using the models
"""

from flask_pymongo import PyMongo


# by convention in the Flask community these are lower case,
# whereas pylint wants them upper case
mongo = PyMongo()  # pylint: disable=invalid-name