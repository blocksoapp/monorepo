import { useContext, useState, useEffect } from 'react'
import { apiPostPost } from '../../api';
import PostForm from './write/PostForm';


function NewPost({ submitPostCallback }) {
    // hooks

    // state
    const [postText, setPostText] = useState("");
    const [taggedUsers, setTaggedUsers] = useState([]);

    // functions

    const handleSubmit = async (event) => {
        // prevent default action
        event.preventDefault();

        // post data to api
        const data = {
            text: postText,
            tagged_users: taggedUsers,
        }
        const resp = await apiPostPost(data);

        // handle success
        if (resp.status === 201) {
            // clear form
            setPostText("");
            setTaggedUsers([]);

            // add post to feed
            const postData = await resp.json();
            submitPostCallback(postData);
        }
    }


    return (
        <PostForm
            handleSubmit={handleSubmit}
            text={postText}
            setText={setPostText}
            taggedUsers={taggedUsers}
            setTaggedUsers={setTaggedUsers}
        />
    )
}

export default NewPost;
