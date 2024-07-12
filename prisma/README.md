# How to populate database

## Step 1: Install Python

    Download Python:
            Go to the Python official website and download the latest version of Python (preferably 3.x).
            Run the Installer:
                    Double-click the downloaded installer.
                    Check the box that says "Add Python to PATH".
                    Click on "Customize installation".
                    Ensure that the "pip" checkbox is selected.
                    Proceed with the installation.

## Step 2: Install Virtual Environment

[more details 1](https://docs.python-guide.org/dev/virtualenvs/)

[more details 2](https://www.freecodecamp.org/news/how-to-setup-virtual-environments-in-python/)

#### Install virtualenv via pip:

```
pip install virtualenv
```

#### Go to a project folder

```
cd .\electricity-shoc\
```

#### Create a virtual environment for a project

```
virtualenv venv
```

#### To begin using the virtual environment, it needs to be activated

Linux

```
source venv/bin/activate
```

Windows

```
venv\Scripts\activate
```

#### * If you are done working in the virtual environment for the moment, you can deactivate it

```
 deactivate
```

## Step 3: Install Required Libraries

Open Command Prompt.
Navigate to prisma Directory.
Install the Required Libraries:
    Run the following command to install all the dependencies listed in the requirements.txt file:

```
pip install -r requirements.txt
```

## Step3: Run script in background

Specify your database connection parameters:

Create file config.py in prisma derictory and add conn_params:

```
conn_params = {
    'dbname': "db_name",
    'user': "user_name",
    'password': "password",
    'host': "localhost",
    'port': "5432"}
```

Run the following command:

```
# Windows
pythonw main.py

# Linux
python& main.py
```

# Stop Python script

## Windows

### Find the process

    Run the following command:

```
tasklist | findstr pythonw
```

### Terminate the process

    Run the following command:

```
taskkill /PID `<PID>` /F
```

    Replace`<PID>` with the actual process ID you noted in the previous step.

## Linux

### Find the process

    Run the following command:

```
ps aux | grep pythonw
```

### Terminate the process

    Run the following command:

```
kill <PID>
```

# Switch SQLite to PostgreSQL

1. Install PostgreSQL Client
2. Create a new PostgreSQL Database (pgAdmin or command line)):
   Command line:

   ```
   psql -h localhost -p 5432 -U postgres
   ```
   ```
   CREATE DATABASE my_new_database;
   ```
3. Update Environment Variables:
   Go to .env file

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"
   ```
   Replace `username`, `password`, `localhost`, `5432`, and `mydatabase` with your actual PostgreSQL credentials and database name.
4. Install PostgreSQL Client Library:

   ```
   npm install pg
   ```
   In case of error (for example: *npm WARN ERESOLVE overriding peer dependency*):
   Clear npm cache:

   ```
   npm cache clean --force
   ```
   Delete `node_modules` and `package-lock.json`

   Update npm:

   ```
   npm install -g npm
   ```
   Reinstall Dependencies:

   ```
   npm install
   ```
5. Migrate Database Schema:
   Since you're switching databases, you need to migrate your existing schema.

   Delete migration folder

   Run migrate command:

   ```
   npx prisma migrate dev
   ```
