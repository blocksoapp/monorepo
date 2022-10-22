import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap"
import { apiGetComments, apiGetPost } from "../../api.js";
import { useUser } from "../../hooks/useUser";
import Comment from "./Comment";
import NewComment from "./NewComment";
import Post from "./Post";
import PostsError from "./PostsError";
import PostsNotFound from "./PostsError";
import PostPlaceholder from "./PostPlaceholder";
import PostsPlaceholder from "./PostsPlaceholder";


function ViewPost(props) {
    // constants
    const { postId } = useParams();
    const user = useUser();  // TODO create context for set/getting the user

    // state
    const [postLoading, setPostLoading] = useState(true);
    const [postError, setPostError] = useState(false);
    const [post, setPost] = useState(null);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsError, setCommentsError] = useState(false);
    const [comments, setComments] = useState([]);

    // functions
    const fetchPost = async (postId) => {
        setPostLoading(true);
        const res = await apiGetPost(postId);

        if (res.status === 200) {
            var data = await res.json();
            setPost(data);
            setPostError(false);
            setPostLoading(false);
        }
        else {
            setPostError(true);
            setPostLoading(false);
            console.error(res);
        }
    }

    const fetchComments = async (postId) => {
        setCommentsLoading(true);
        const res = await apiGetComments(postId);

        if (res.status === 200) {
            var data = await res.json();
            setComments(data["results"]);
            setCommentsError(false);
            setCommentsLoading(false);
        }
        else {
            setCommentsError(true);
            setCommentsLoading(false);
            console.error(res);
        }
    }

    const submitCommentCallback = (newComment) => {
        setComments([newComment].concat(comments));
    }


    // effects

    /* 
     * Fetches Post, Comments on component mount.
     */
    useEffect(() => {
        fetchPost(postId);
        fetchComments(postId);
    }, [])


    const render = function () {
        return (
            <>
            {user !== null &&
            <Container className="mt-4">

                {/* Post Section -- show placeholder or post */}
                {postLoading === true
                    ? <PostPlaceholder />
                    : postError === true
                        ?   <PostsError retryAction={fetchPost} />
                        :   <Post
                                bg="#fff0f0"
                                key={post.id}
                                id={post.id}
                                author={post.author}
                                text={post.text}
                                imgUrl={post.imgUrl}
                                created={post.created}
                                refTx={post.refTx}
                                profileAddress={user.profile.address}
                            />
                }

                {/* New Comment Section -- show form for new comment */}
                <NewComment
                    profileData={user}
                    submitCommentCallback={submitCommentCallback}
                    postId={postId}
                />

                {/* Comments Section -- show placeholder or comments */}
                {commentsLoading === true
                    ? <PostsPlaceholder />
                    : commentsError === true
                        ? <PostsError retryAction={fetchComments} />
                        : comments.length === 0
                            ? <PostsNotFound retryAction={fetchComments} />
                            : comments.map(comment => (
                                <Comment
                                    key={comment.id}
                                    author={comment.author}
                                    text={comment.text}
                                    created={comment.created}
                                    pfp={comment.pfp}
                                    profileAddress={user.profile.address}
                                />
                ))}

            </Container>
            }
            </>
        )
    }

    return render();
}

export default ViewPost;
