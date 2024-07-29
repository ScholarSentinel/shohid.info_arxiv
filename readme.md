# [`shohid.info`](https://shohid.info/) Public Archive
This public repository provides archived version of the website: https://shohid.info/.

**If the actual website is blocked in your area, you can visit archived version here:**  https://scholarsentinel.github.io/shohid.info

You can get the files of the archived copy here: https://github.com/scholarsentinel/shohid.info

![image](webpage_icon.png)

This repository will help you to:

1. Download archived version of the website: https://shohid.info/ . This archived version is updated daily.
2. Use the tool provided here for downloading your own archived version.
3. Host it on your personal PC for offline browsing of the website.

## How to Download [`shohid.info`](https://shohid.info/) Website

### Download Archived Copy

1. Download the `downloaded_site.zip` from this repository. 
2. Unzip the file for offline browsing. That's it! 

    This archived version can be hosted on your PC (_see section:_ **How to Run the Website on Your PC**).

### Steps to Download Manually

1. On Windows, install Node.js from [this link](https://nodejs.org/en/download/prebuilt-installer). If you are a Linux user, run the following in the terminal: 

        sudo apt install nodejs
        sudo apt install npm

    Optional: Verify the installation by opening the command prompt and running:

        node -v        
        npm -v

    You should see the version numbers.

2. Install the Puppeteer package:

        npm install puppeteer

3. Install the Axios package:

        npm install axios

    If you encounter issues installing Node.js, Axios, or Puppeteer, ask ChatGPT for assistance.

4. Download `SiteGrabber.js` file from this repository.

5. Navigate to the folder where you downloaded `SiteGrabber.js`.

6. Right-click in this folder and select "Open command prompt here".

7. Run the following command in the command prompt:

        node SiteGrabber.js

    The website will be downloaded to the `downloaded_site` folder.

## How to Run the Website on Your PC

1. Install Python from [this link](https://www.python.org/downloads/windows/). Or, install httr-server package via Node.js by running one of the following commands:

        npm install -g http-server
    
    or

        sudo npm install -g http-server

2. Navigate to the `downloaded_site` folder and open a command prompt.

3. Run the following command if you are using Python:

        python -m http.server
    
    or the following if you want to use Node.js:
    
        http-server

4. Open a web browser and go to `http://localhost:8000/`. You are now running the website on your PC.
