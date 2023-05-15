import { useState } from "react";
import { baseAPI, getCookie } from "../../../utils";
import PostForm from "../write/PostForm";

function NewComment({ submitCommentCallback, postId }) {
  // state
  const [commentText, setCommentText] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);

  // functions

  const handleSubmit = async (event) => {
    // prevent default action
    event.preventDefault();

    // post data to api
    const url = `${baseAPI}/posts/${postId}/comments/`;
    const data = {
      text: commentText,
      tagged_users: taggedUsers,
    };
    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFTOKEN": getCookie("csrftoken"),
      },
      credentials: "include",
    });

    // handle success
    if (resp.status === 201) {
      // clear form
      setCommentText("");
      setTaggedUsers([]);

      // add comment to post
      const commentData = await resp.json();
      submitCommentCallback(commentData);
    }
  };

  return (
    <PostForm
      handleSubmit={handleSubmit}
      text={commentText}
      setText={setCommentText}
      taggedUsers={taggedUsers}
      setTaggedUsers={setTaggedUsers}
      padding="p-0"
    />
  );
}

export default NewComment;
