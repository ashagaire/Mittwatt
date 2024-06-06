# Step-by-Step Instructions
## Step 1: Install Python
        Download Python:
            Go to the Python official website and download the latest version of Python (preferably 3.x).
            Run the Installer:
                    Double-click the downloaded installer.
                    Check the box that says "Add Python to PATH".
                    Click on "Customize installation".
                    Ensure that the "pip" checkbox is selected.
                    Proceed with the installation.

## Step 2: Install Required Libraries
Open Command Prompt.
Navigate to prisma Directory.
Install the Required Libraries:
    Run the following command to install all the dependencies listed in the requirements.txt file:
        pip install -r requirements.txt

## Step3: Run script in background
Run the following command:
    pythonw script.py

# Stop Python script

## Windows 
### Find the process
    Run the following command:
        tasklist | findstr pythonw
### Terminate the process
    Run the following command:
        taskkill /PID <PID> /F
    Replace <PID> with the actual process ID you noted in the previous step.

## Linux
### Find the process
    Run the following command:
        ps aux | grep pythonw
### Terminate the process
    Run the following command:
        kill <PID>

 