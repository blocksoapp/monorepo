import React, { useState, useEffect } from 'react'
import { Container } from "react-bootstrap"
import { baseAPI } from '../../utils'
import NewPost from '../posts/NewPost.js';
import Post from '../posts/Post.js'; 
import PostsPlaceholder from '../posts/PostsPlaceholder';
import FeedError from './FeedError';


function Feed({ profileData }) {

    // constants

    // state
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [feedError, setFeedError] = useState(false);
    const [posts, setPosts] = useState(null);

    // functions
    const submitPostCallback = (newPost) => {
        setPosts([newPost].concat(posts));
    }

    const fetchFeed = async () => {
        // make request for feed data
        const url = `${baseAPI}/feed/`;
        setLoadingFeed(true);
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });

        // success handling
        if (res.status === 200) {
            var data = await res.json();
            setPosts(data);
            setFeedError(false);
            setLoadingFeed(false);
        }
        // error handling
        else {
            setFeedError(true);
            setLoadingFeed(false);
            console.error(res);
        }
    }

    // fetch feed on mount
    useEffect(() => {
        fetchFeed();
    }, [])


    return (
        <Container>

            {/* New Post Form */}
            <NewPost
                profileData={profileData}
                submitPostCallback={submitPostCallback}
            />

            {/* Feed or Placeholder */}
            {loadingFeed === true
            ? <PostsPlaceholder />
            : feedError === true
                ? <FeedError retryAction={fetchFeed} />
                : <Container>
                    {posts && posts.map(post => (
                        <Post
                            key={post.id}
                            id={post.id}
                            author={post.author.address}
                            text={post.text}
                            pfp={post.author.image}
                            imgUrl={post.imgUrl}
                            created={post.created}
                            refTx={post.refTx}
                            numComments={post.numComments}
                            profileAddress={profileData['address']}
                        />
                    ))}
                </Container>
            }

        </Container>
    )
}

export default Feed;
