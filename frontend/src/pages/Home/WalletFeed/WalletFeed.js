import React, { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import Post from '../../../components/post.js'; 
import { baseAPI } from '../../../utils.js'


function WalletFeed(props) {

    // state
    const [posts, setPosts] = useState(null);
 
    // functions
    const fetchFeed = async () => {
        const url = `${baseAPI}/feed/`;
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        if (res.status === 200) {
            var data = await res.json();
            setPosts(data);
        }
        else { console.log("unhandled case: ", res) }
    }

    // effects
    useEffect(() => {
        fetchFeed();
    }, [])


  return (
    <Container fluid>

        {/* Posts Section */}
        <Container>
            {posts && posts.map(post => (
                <Post
                    key={post.id}
                    author={post.author}
                    text={post.text}
                    imgUrl={post.imgUrl}
                    created={post.created}
                    refTx={post.refTx}
                />
            ))}
        </Container>

    </Container>
  )

}

export default WalletFeed;
