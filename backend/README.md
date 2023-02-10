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
1. Revisit when users' tx history should be fetched and transformed to posts.  
2. Add business logic checks for Posts that are quoted, shared, or refer to a tx.
3. Migration `0011_remove_feed_profiles...` sets Profile id 1 as the owner of all pre-existing Feeds. Be mindful of this -- shouldn't be a problem for Production on the date of this commit, but it's good to keep this in mind for redeployments or running migrations on an existing environment.
