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

## How to Run Worker  
To run a worker that will fetch new transactions in the background for all users in the system, you must do the following:  
1. Install `redis-server` locally.
2. Make sure the redis server is running.
2. Run `python manage.py heroku-worker`

## Tech Debt & Notes  
1. Make sure the authed user can only create profiles for themselves.  
2. Revisit when users' tx history should be fetched and transformed to posts.  
3. Add business logic checks for Posts that are quoted, shared, or refer to a tx.
4. Add a job queueing system for fetching the user's tx history.
5. Fix broken tests due to creating a Profile on user sign in.
