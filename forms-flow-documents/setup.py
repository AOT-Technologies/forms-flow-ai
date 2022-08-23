"""Installer and setup for this module."""

from glob import glob
from os.path import basename, splitext

from setuptools import find_packages, setup


def read_requirements(filename):
    """Get application requirements from the requirements.txt file.
    :return: Python requirements
    :rtype: list
    """
    with open(filename, "r") as req:
        requirements = req.readlines()
    install_requires = [r.strip() for r in requirements if r.find("git+") != 0]
    return install_requires


def read(filepath):
    """Read the contents from a file.
    :param str filepath: path to the file to be read
    :return: file contents
    :rtype: str
    """
    with open(filepath, "r") as file_handle:
        content = file_handle.read()
    return content


REQUIREMENTS = read_requirements("requirements.txt")

setup(
    name="formsflow_documents",
    packages=find_packages("src"),
    package_dir={"": "src"},
    py_modules=[splitext(basename(path))[0] for path in glob("src/*.py")],
    include_package_data=True,
    long_description=read("README.md"),
    zip_safe=False,
    install_requires=REQUIREMENTS,
    setup_requires=[
        "pytest-runner",
    ],
    tests_require=[
        "pytest",
    ],
)
