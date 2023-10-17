"""Module to handle custom file log handler."""
import gzip
import os
import shutil


def namer(name):
    """Custom log file namer that appends ".gz" to the file name."""
    return name + ".gz"


def rotator(source, dest):
    """
    Custom log file rotator that compresses the log file and moves it to the archive folder.

    Args:
        source (str): The path to the source log file.
        dest (str): The path to the destination log file (within the archive folder).
    """
    archive_folder = os.path.join(os.path.dirname(dest), "archive")
    if not os.path.exists(archive_folder):
        os.makedirs(archive_folder)
    dest_in_archive = os.path.join(archive_folder, os.path.basename(dest))

    with open(source, "rb") as f_in:
        with gzip.open(dest_in_archive, "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)
    os.remove(source)
