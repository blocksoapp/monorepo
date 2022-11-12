import { useEffect, useState, useContext } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Container } from "react-bootstrap"
import { apiGetComments, apiGetPost, apiGetUrl } from "../../api.js";
import Comment from "./comments/Comment";
import NewComment from "./comments/NewComment";
import SignInToComment from "./SignInToComment";
import Post from "./Post";
import PostsError from "./PostsError";
import CommentsNotFound from "./comments/CommentsNotFound";
import MoreComments from "./comments/MoreComments";
import PostPlaceholder from "./PostPlaceholder";
import PostsPlaceholder from "./PostsPlaceholder";
import { UserContext } from '../../contexts/UserContext'


function ViewPost(props) {
    // constants
    const { postId } = useParams();
    const { user } = useContext(UserContext)


    // state
    const [postLoading, setPostLoading] = useState(true);
    const [postError, setPostError] = useState(false);
    const [post, setPost] = useState(null);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsError, setCommentsError] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsNextPage, setCommentsNextPage] = useState(null);
    const [moreCommentsLoading, setMoreCommentsLoading] = useState(false);
    const [moreCommentsError, setMoreCommentsError] = useState(false);

    // functions
    const fetchPost = async () => {
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

    const fetchComments = async () => {
        setCommentsLoading(true);
        const resp = await apiGetComments(postId);

        // success
        if (resp.status === 200) {
            var data = await resp.json();
            setComments(data["results"]);
            setCommentsError(false);
            setCommentsLoading(false);
            setCommentsNextPage(data["next"]);
        }
        // error
        else {
            setCommentsError(true);
            setCommentsLoading(false);
            console.error(resp);
        }
    }

    const fetchMoreComments = async () => {
        setMoreCommentsLoading(true);
        const resp = await apiGetUrl(commentsNextPage);

        // success
        if (resp.status === 200) {
            var data = await resp.json();
            setComments(comments.concat(data["results"]));
            setMoreCommentsError(false);
            setMoreCommentsLoading(false);
            setCommentsNextPage(data["next"]);
        }
        // error
        else {
            setMoreCommentsError(true);
            setMoreCommentsLoading(false);
            console.error(resp);
        }
    }

    const submitCommentCallback = (newComment) => {
        // update the number of comments on the post
        setPost({
            ...post,
            numComments: post["numComments"] + 1
        });

        // add the new comment to the list of comments
        setComments([newComment].concat(comments));    
    }


    // effects

    /* 
     * Fetches Post, Comments on component mount.
     */
    useEffect(() => {
        // reset state
        setPostLoading(true);
        setPost(null);
        setPostError(false)
        setCommentsLoading(true);
        setComments([]);
        setCommentsError(false);
        setMoreCommentsError(false);
        setMoreCommentsLoading(false);
        setCommentsNextPage(null);

        // fetch post and comments
        fetchPost();
        fetchComments();
    }, [postId])


    const render = function () {
        return (
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
                                author={post.author.address}
                                text={post.text}
                                imgUrl={post.imgUrl}
                                created={post.created}
                                refTx={post.refTx}
                                numComments={post.numComments}
                                pfp={post.author.image}
                            />
                }

                {/* New Comment Section -- show form for new comment */}
                {user === null
                    ?   <SignInToComment />
                    :   <NewComment
                            authedUser={user}
                            submitCommentCallback={submitCommentCallback}
                            postId={postId}
                        />
                }

                {/* Comments Section -- show placeholder or comments */}
                {commentsLoading === true
                    ? <PostsPlaceholder />
                    : commentsError === true
                        ? <PostsError retryAction={fetchComments} />
                        : comments.length === 0
                            ? <CommentsNotFound retryAction={fetchComments} />
                            : comments.map(comment => (
                                <Comment
                                    key={comment.id}
                                    author={comment.author.address}
                                    text={comment.text}
                                    created={comment.created}
                                    pfp={comment.author.image}
                                />
                ))}

                {/* More Comments Link (pagination) */}
                {commentsNextPage === null
                    ? <></>
                    : moreCommentsLoading === true
                        ? <PostsPlaceholder />
                        : moreCommentsError === true
                            ? <PostsError retryAction={fetchMoreComments} />
                            : <MoreComments action={fetchMoreComments} />
                }

            </Container>
        )
    }

    return render();
}

export default ViewPost;
