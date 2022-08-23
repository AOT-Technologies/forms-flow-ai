import setuptools
from glob import glob
from os.path import basename, splitext

def read(filepath):
    """Read the contents from a file.
    :param str filepath: path to the file to be read
    :return: file contents
    :rtype: str
    """
    with open(filepath, "r") as file_handle:
        content = file_handle.read()
    return content


def read_requirements(filename):
    """Get application requirements from the requirements.txt file.
    :return: Python requirements
    :rtype: list
    """
    with open(filename, "r") as req:
        requirements = req.readlines()
    install_requires = [r.strip() for r in requirements if r.find("git+") != 0]
    return install_requires

REQUIREMENTS = read_requirements("requirements.txt")

setuptools.setup(
    name='formsflow_api_utils',
    version='1.0.0',
    author='AOT',
    description='Formsflow api related libraries.',
    long_description=read("README.md"),
    long_description_content_type="text/markdown",
    url='https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-api-utils',
    packages=setuptools.find_packages("src"),
    package_dir={"": "src"},
    py_modules=[splitext(basename(path))[0] for path in glob("src/*.py")],
    include_package_data=True,
    zip_safe=False,
    install_requires=REQUIREMENTS,
)