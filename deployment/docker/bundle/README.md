# Installation-Automation
In the following document, we’ll describe about the various steps involved in the automation installation.
 
# Table of Contents
1. [Summary](#summary)
2. [Windows Installation](#windows-installation)
3. [Linux Installation](#linux-installation)
4. [Conclusion](#conclusion)


## Summary

In this document we will discuss the Installation process that we have automated for the users. The installation procedures and time consuming has been reduced for the better implementation. Now we will provide a bundle in the docker as well as in the Forms-Flow-AI home page. You just need to download the zip file and extract it wherever you want the project to be installed. Then follow the below steps and instructions for the installation.


## Windows Installation

After you extract the file you will get a bundle as a folder. You can see two script files and one configuration file in it. You can just double click on the windows batch script file “start.bat” to start the installation procedure. While installation you must provide some prompt answers and the redash api key (you will get the redash api key only if you include analytics in your installation and after the analytics is up in the docker). .[Bundle](./bundle)
Now you can follow the steps below to understand the installation:
*	Firstly, you will receive a prompt question regarding the installation of analytics in the process. Its your choice to add   analyctics or just type n and continue.
*	You can see the order of installation in the screen.
*	First, it will automatically take you to the keycloak installation. If you already have a keycloak, you can move to the custom installation and provide the values and id’s in the installation.
*	If you do not have a keycloak It will automatically setup a keycloak for you.
*	Then it will take you to the analytics if you have chosen analytics in your installation, or else it will go to the further installation.
*	After the forms-flow-forms gets up, you can wait for a couple of seconds as shown for the browser to load.
*	Then it moves in the order-> web->BPM->web-api.
*	Then the installation will be finished and you can see the >env’s automatically created and you can check the docker desktop to see whether all are working fine.


## Linux Installation

Same as mentioned in windows installation,  you will get a bundle as a folder. You can see two script files and one configuration file in it. You can run the shell script file “start.sh” in the terminal from the corresponding folder to start the installation procedure in the terminal. While installation you must provide some prompt answers and the redash api key (you will get the redash api key only if you include analytics in your installation and after the analytics is up in the docker).
Now you can follow the steps below to understand the installation:

*	Firstly, you will receive a prompt question regarding the installation of analytics in the process. Its your choice to add analytics or just type n and continue.
*	You can see the order of installation in the screen.
*	First, it will automatically take you to the keycloak installation. If you already have a keycloak, you can move to the custom installation and provide the values and id’s in the installation.
*	If you do not have a keycloak It will automatically setup a keycloak for you.
*	Then it will take you to the analytics if you have chosen analyctics in your installation, or else it will go to the further installation.
*	After the forms-flow-forms gets up, you can wait for a couple of seconds as shown for the browser to load.
*	Then it moves in the order-> web->BPM->web-api.
*	Then the installation will be finished and you can see the >env’s automatically created and you can check the docker desktop to see whether all are working fine.



## Conclusion

This installation is set up for the easy installation of the project Foms-flow.ai. You are free to change your .env file variable at any time you wish. Any further changes that will be added in the future will be added in the installation. If you need to to statically change it, you are free to do any updates in the env file.

