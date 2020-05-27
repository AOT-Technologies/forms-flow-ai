import logging
import os


def writeException(log):   
    writeLog(log,logging.ERROR)   

def writeLog(log,LOG_LEVEL=logging.WARNING):      
    if LOG_LEVEL == logging.ERROR:
        logging.error(log)
        
    logging.basicConfig(filename='FORMIO.log')   
    if LOG_LEVEL == logging.WARNING:
        logging.warning(log)
    elif LOG_LEVEL == logging.ERROR:
        logging.error(log)