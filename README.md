# monorepo

## Design

Idea & MVP Features

In one sentence, the idea is to create a social media platform for blockchain users!

A user would:
 - Connect their wallet
 - Upload a profile pic or select an NFT they own.
 - Write a bio blurb.
 - Follow other wallets.
 - See a feed of their activity and the wallets they follow.
 - Comment, like, share, and quote post items from their feed.
 - Link their Website, Twitter, Instagram, OpenSea, Looksrare
 - Receive notifications (stretch goal)
 - Messaging (stretch goal)

Sponsors & Awards
 - Covalent to grab transaction data of a user.
 - IPFS to store profile pics, and read NFTs.
 - ENS to be able to find a profile more easily.
 - EPNS to send notifications to users (stretch goal)
 - XMTP for messaging (stretch goal)
 - Login with UnstoppableDomains (stretch goal)


Frontend Design
A user would:
 - Connect their wallet
    - Frontend uses ethers.js to allow a user to connect their wallet with metamask
    - User unlocks metamask if needed
    - User is prompted to sign a message with the description "Hello, I am <insert public address here>"
        - https://docs.ethers.io/v5/api/signer/#Signer-signMessage
        - https://medium.com/coinmonks/signing-messages-in-ethereum-5517040c2ff1
    - Frontend sends the signed message to the backend
        - `POST /api/auth/`
        - `{'signature': 'SIGNATURE RETURNED FROM ETHERS.JS'}`
    - Frontend receives a `200 OK` or `401 UNAUTHORIZED` from the backend
        - `200 OK`
            - Show feedback that user logged in successfully
            - Make request to get the user's feed
                - `GET /api/feed/`
        - `401 UNAUTHORIZED`
            - Don't worry about this for now.

 - Upload a profile pic or select an NFT they own.
    - Frontend asks the user for the contract address and tokenId of an NFT they own, OR
        for them to select an image to upload.
    - If user enters contract address and tokenId, frontend uses that to query the smart contract and get the image URL
    - If user selects an image from their library, frontend uses nft.storage to upload the photo to IPFS. This is probably better handled by the backend, but choosing to do it on the frontend for now to help distribute the work. 
    - Frontend sends the image url to the backend
        - `POST /api/profile/image/`
        - `{'image': 'https://ipfs.io/ipfs/<cid>'}`
    - Frontend receives an updated Profile from the backend
        - `200 OK`
            - See 'Profile JSON' below
            - Show success feedback
        - `400 BAD REQUEST`
            - Show error feedback

 - Write a bio blurb
    - Frontend sends bio as text to the backend
        - `POST /api/profile/bio/`
        - `{"bio": "bio text"}`
    - Frontend receives updated Profile
        - `200 OK`
            - See 'Profile JSON' below
            - Show success feedback
        - `400 BAD REQUEST`
            - Show error feedback

 - Follow other wallets.
    - Frontend sends public address to follow to the backend
        - `POST /api/follow/`
        - `{"address": "0x..."}`
    - Frontend receives a 200 on success
        - `200 OK`
            - Show success feedback
        - `400 BAD REQUEST`
            - Show error feedback

 - See a feed of their activity and the wallets they follow.
    - Frontend sends a request to receive a feed of activity
        - `GET /api/feed/`
    - Frontend receives a feed of activity of Posts, sorted by descending time stamp
        - `200 OK`
            - See "Feed JSON" below
        - `400 BAD REQUEST`
            - Show error feedback

 - Comment, like, share, and quote post items from their feed.
    - Comment
        - Frontend sends a request containing postId and comment text
            - `POST /api/posts/<postId>/comments/`
            - `{"comment": "some text"}`
        - Frontend receives an updated Post that it can add to the timeline
            - `200 OK`
                - Show success feedback
                - See "Post JSON" below.
            - `400 BAD REQUEST`
                - Show error feedback

    - Like
        - Frontend sends a like request with value `true|false`
            - `POST /api/posts/<postId>/likes/`
            - `{"likedByMe": true|false}`
        - Frontend receives Like data that includes whether the user liked or unliked, and the total number of likes for the post
            - `200 OK`
                - Show success feedback
                - `{"numLikes": "", "likedByMe": true|false}`
            - `400 BAD REQUEST`
                - Show error feedback

    - Share
        - Frontend sends a request containing the postId to be shared
            - `POST /api/posts/<postId>/share/`
        - Frontend receives a Post object that it can add to the timeline
            - `200 OK`
                - Show success feedback
                - See "Post JSON" below.
            - `400 BAD REQUEST`
                - Show error feedback

    - Post
        - Frontend sends a request with text, image ipfs url to backend
            - `POST /api/posts/`
            - `{"text": "", "imageUrl": "ipfs url of image"}`
            The frontend should upload the image to IPFS before, then get its URL, then send that to the backend.
            This is probably better handled by the backend, but choosing to do it on the frontend for now to help distribute the work. 
        - Frontend receives an updated Feed with activity
            - `200 OK`
                - Show success feedback
                - See "Feed JSON" below.
            - `400 BAD REQUEST`
                - Show error feedback

 - Link their Website, Twitter, Instagram, Opensea, Looksrare.
    - Frontend sends request with URLs of website, twitter, instagram, opensea, looksrare
        - `POST /api/socials/`
        - ```{"website": "SOME URL",
        "twitter": "SOME URL",
        "instagram": "SOME URL",
        "opensea": "SOME URL",
        "looksrare": "SOME URL"}```
    - Frontend receives updated Profile
        - `200 OK`
            - Show success feedback
            - See "Profile JSON" below.
        - `400 BAD REQUEST`
            - Show error feedback


Profile JSON
```
{
    "image": "SOME URL",
    "socials": {
        "website": "SOME URL",
        "twitter": "SOME URL",
        "instagram": "SOME URL",
        "opensea": "SOME URL",
        "looksrare": "SOME URL"
    },
    "bio": "bio description",
    "numFollowers": "num of followers",
    "numFollowing": "num of following",
    "address": "0x...",
    "posts": [20 most recent posts, see "Post JSON" below]
}
```


Post JSON
```
{
    "postId": "",
    "author": "0x...",
    "text": "",
    "imgUrl": "",
    "isShare": true|false,
    "isQuote": true|false,
    "refPost": {
        "postId": "",
        "author": "0x...",
        "text": "",
        "imgUrl": "",
        "isShare": true|false,
        "isQuote": true|false,
        "refPost": null,
        "numLikes": "",
        "likedByMe": true|false,
        "comments": [{
            "author": "0x...",
            "ownedByMe": true|false,
            "text": "",
            "numLikes": "",
            "likedByMe": true|false,
            "created": "timestamp"
        }],
        "created": "timestamp"
    },
    "numLikes": "",
    "likedByMe": true|false,
    "comments": [{
        "author": "0x...",
        "ownedByMe": true|false,
        "text": "",
        "numLikes": "",
        "likedByMe": true|false,
        "created": "timestamp"
    }],
    "created": "timestamp"
}
```


Feed JSON
```
[
    {Post JSON above},
    {Post JSON above},
    ...
]
```


Backend Design
A user would:
 - Connect their wallet
    - Backend receives a signature that it stores for that wallet address
        - Store user public address + signature

 - Select an NFT they own.
    - Backend receives a URL of the image
    - Store url
    - Backend returns updated Profile to frontend 

 - Write a bio blurb
    - Backend receives a description.
    - Store blurb as a text field.

 - Follow other wallets.
    - Backend receives a public address
    - Store public address
    - Query the transaction history of the given address and store it in a tx table, create Posts from it

 - See a feed of their activity and the wallets they follow.
    - Backend receives a request to show feed
    - Backend queries all the txs of all the accounts that the requestor follows
    - Backend returns a feed sorted by descending timestamp

 - Comment, like, share, and quote post items from their feed.
    - Comment
        - Backend receives a postId and comment text
        - Store comment related to postId
        - Return updated Post
    - Like
        - Backend receives a like request
        - Backend increments the number of likes the post has
        - Returns Nothing, frontend increments number of Likes in its local state
        - Returns a like object that includes whether the user liked or unliked, and the total number of likes for the post
    - Share
        - Backend receives a share request that includes a postId
        - Store an empty Post that references the given postId
            - set isShare flag to true
        - Backend returns new Post
    - Post
        - Backend receives text, image data or ipfs url if submarining is supported
        - Store photo url, text, tx reference if any
        - Return updated Feed

 - Link their Website, Twitter, Instagram.
    - Backend receives links for website, twitter, instagram, opensea, looksrare
    - Store them in Socials table
    - Return updated profile to frontend

 - Messaging (stretch goal)
    - Look into XMTP and how to use it
