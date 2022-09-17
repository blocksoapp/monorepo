# Blockso Backend

## Requirements 
 - Python 3.10

## How to Build  
Make sure you have the requirements above installed, then run the `build.sh` script on the command line like `./build.sh`

## How to Run Server  
1. Make sure you've run the build once before, see steps above.
2. Activate the virtual environment by running `source ./env/bin/activate`.
3. Run the server by doing `python manage.py runserver`  

## How to Run Tests  
`python manage.py test`

## Tech Debt & Notes  
1. Make sure the authed user can only create profiles for themselves.  
2. Revisit when users' tx history should be fetched and transformed to posts.  
