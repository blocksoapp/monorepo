Blockso Frontend ReadMe Guide 

## How to set up project
1. `npm install` 


## How to run server
1. Create a copy of `env.example` and name it `.env`.  
2. Edit `.env` to suit your environment.  
3. Run the server with `npm run start`.


## Design

_Pages_
	•	Explore Page (default when not signed-in, navigatable)
	•	Home Page (signed-in)
	•	Create Profile Page
	•	Edit Profile Page
	•	Wallets page
	•	Profile page

Explore Page: general page displaying information when user is not signed in. Display top 10 wallets consisting of thumbnails (profile img, ens, follow button) eg: ethleaderboard. Has search component where you can find wallets + follow them.

Home page: The “DAPP”. This page displays connected user, notifications, wallet activity feed, header, and footer.

Create profile page: If connected wallet is not registered, they are directed to create a profile page. Must fill out form including: image, bio, and social media links. Upon submission, user redirected to Home page.

Edit profile page: Page where user can update their profile information. Accessed from profile page.

Wallets page: User can enter a wallet id (if valid checkmark appears) and follow. Page displays wallets followed component and users can unfollow (delete) wallets here.

Profile page: Each user has a profile page. When click on image on home page or follow feed, redirects to specific profile page. Page displays image, bio, links (shows 3 with expand option) , and most recent transactions (limited to 5).

_Components_

Universal: 
Navbar.js
Footer.js
Modal.js

Explore Page:
Explore.js
Search.js
ExploreLeaderboard/
Leaderboard.js
LeaderboardThumbnail.js (profile img, ens, follow button)


Home Page:
Home.js
WalletFeed/
WalletFeed.js
Wallet.js
WalletTransaction.js (img, name, time, transaction)
WalletActions.js (comment, like, share)


Auth/ 
Authentication.js
	- Props: Signature (ethers.js)
	- Function: connectWallet()
	- Returns: Successful Login / Unsuccessful Login

Notifications/ (if we have time)

Modal —> 	- HomeAction.js (img, ens, add wallet, edit info)

Create Profile Page:
NewProfile.js
NewProfileContent.js

Can breakdown further if necessary

Wallets page:
Wallets.js
- AddWallet.js
- Followed.js (map out from followed array)
	-FollowedAddress.js (individual address)

Profile page:
Profile.js
-ProfileContent.js
	-ProfileImage.js
	-ProfileLinks.js
-RecentTx.js


Tasks Priority -
Most important features:
Connecting wallet
Create profile
Follow wallets, 
See feed of activity

Nice to have:
Ens stuff (translating ens names > wallet address)
Explore page
Notifications

Add if time permits:
Commenting, like, quote, share
Messaging





