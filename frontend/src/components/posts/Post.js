import { useEffect, useRef, useState } from "react";
import { 
    Badge,
    Button,
    Container,
    Card,
    Col,
    Image,
    OverlayTrigger,
    Popover,
    Row 
} from "react-bootstrap"
import { useNavigate } from "react-router-dom";
import { useEnsAvatar, useEnsName } from "wagmi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart,
    faComment,
    faRetweet,
} from '@fortawesome/free-solid-svg-icons';
import { apiDeletePostLike, apiDeleteRepost, apiPostPostLike, apiPostPost } from "../../api";
import { formatTokenAmount, getTimeAgo } from "../../utils";
import MentionsOutput from './MentionsOutput';
import PfpResolver from '../PfpResolver';
import AuthorAddress from "./AuthorAddress";
import TxAddress from "../TxAddress";
import ERC20Post from "./ERC20Post";
import ERC721Post from "./ERC721Post";


function Post({data, bgColor}) {
    // constants
    const datetimeOpts = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric'
    };

    const txTypes = {
        Transaction: "transaction",
        ERC20Transfer: "erc20transfer",
        ERC721Transfer: "erc721transfer",
    }

    // state
    const navigate = useNavigate();
    const [postData, setPostData] = useState(data);
    const [erc20Transfers, setErc20Transfers] = useState([]);
    const [erc721Transfers, setErc721Transfers] = useState([]);
    const [txType, setTxType] = useState(null);
    const repostRef = useRef(null);


    // functions

    const determinePostType = function() {
        // do nothing if the post is not a repost
        if (!data.refPost) return

        // if the post is a repost, then set its properties
        // to mimic those of the post it is referencing
        setPostData({
            repostedBy: data.author,
            ...data.refPost,
        });
    }
    
    // TODO this will be adjusted in the future to deal
    // with more complex transactions
    const determineTxType = function() {
        // return if there is no ref tx
        if (!postData.refTx) return

        // ERC20 transfer
        if (postData.refTx.erc20_transfers.length > 0 &&
            postData.refTx.erc721_transfers.length === 0) {

            setErc20Transfers(postData.refTx.erc20_transfers);
            setTxType(txTypes.ERC20Transfer);
        }

        // ERC721 transfer
        else if (postData.refTx.erc721_transfers.length > 0 &&
                 postData.refTx.erc20_transfers.length === 0) {

            setErc721Transfers(postData.refTx.erc721_transfers);
            setTxType(txTypes.ERC721Transfer);
        }

        // all other transactions
        else {
            setTxType(txTypes.Transaction);
        }
    }

    /* 
     * Formats the result of getTimeAgo based on its result.
     * If the result is greater than 3 characters, then
     * show the result without the "ago" suffix.
     * Otherwise show the "ago" suffix.
     */
    const formatTimeAgo = function(timeAgo) {
        return (timeAgo.length > 3 || timeAgo.toLowerCase() === "now")
            ? timeAgo
            : `${timeAgo} ago`
    }

    /*
     * Handles user clicking the repost button.
     * Reposts the item if the user has not already reposted it.
     * Deletes the user's repost if the user has already reposted the item.
     */
    const handleRepostClick = async function() {
        if (postData.repostedByMe === true) {
            return deleteRepost();
        }
        else {
            return doRepost();
        }
    }

    /*
     * Reposts the current post as the authenticated user.
     */
    const doRepost = async function() {
        // prepare the request
        const requestData = {
            refPost: postData.id,
            isShare: true
        }
        const resp = await apiPostPost(requestData);

        // success handling
        if (resp.status === 201) {
            //var data = await resp.json();
            setPostData({
                ...postData,
                numReposts: postData["numReposts"] + 1,
                repostedByMe: true
            });
            repostRef.current.click();
        }
        // error handling
        else {
            console.error(resp);
        }        
    }

    /*
     * Deletes the user's repost.
     */
    const deleteRepost = async function() {
        const resp = await apiDeleteRepost(postData["id"]);

        // success handling
        if (resp.status === 204) {
            setPostData({
                ...postData,
                numReposts: postData["numReposts"] - 1,
                repostedByMe: false
            });
        }
        // error handling
        else {
            console.error(resp);
        }        
    }

    /*
     * Handles user clicking the Like button.
     * Likes the item if the user has not already liked.
     * Unlikes the item if the user has already liked it.
     */
    const handleLikeClick = async function() {
        postData.likedByMe ? await doUnlikePost() : await doLikePost();
    }

    /*
     * Likes the current post as the authenticated user.
     */
    const doLikePost = async function() {
        const resp = await apiPostPostLike(postData.id);

        // success handling
        if (resp.status === 201) {
            setPostData({
                ...postData,
                numLikes: postData["numLikes"] + 1,
                likedByMe: true
            });
        }
        // error handling
        else {
            console.error(resp);
        }        
    }

    /*
     * Un-Likes the current post as the authenticated user.
     */
    const doUnlikePost = async function() {
        const resp = await apiDeletePostLike(postData.id);

        // success handling
        if (resp.status === 204) {
            setPostData({
                ...postData,
                numLikes: postData["numLikes"] - 1,
                likedByMe: false
            });
        }
        // error handling
        else {
            console.error(resp);
        }        
    }

    /* 
     * Determines post type on props change.
     */
    useEffect(() => {
        determinePostType();
    }, [data])

    /* 
     * Determines tx type on postData change.
     * E.g. erc20 tx, erc721 tx
     */
    useEffect(() => {
        determineTxType();
    }, [postData])


    const render = function () {

        // only show transactions we have rich support for atm 
        // so that feeds looks more alive
        if (erc20Transfers.length > 1 ||
            txType === txTypes.Transaction) return

        return (
            <Container id={postData.id} className="mt-4">
                <Row className="justify-content-center mb-4">
                    <Col xs={12} lg={6}>
                        <Card>
                            {/* Card header that includes pfp, address, created time. */}
                            <Card.Header style={{ backgroundColor: bgColor}}>

                                {/* Reposted By badge */}
                                {postData["repostedBy"] &&
                                 <Row>
                                    <p className="fs-6 text-end">
                                        <Badge bg="info">
                                            Reposted by &nbsp;
                                            <AuthorAddress
                                                address={postData["repostedBy"]["address"]}
                                            />
                                        </Badge>
                                    </p>
                                 </Row>
                                }

                                {/* post author pfp, address, created time. */}
                                <Row className="align-items-end">
                                    <Col className="col-auto">
                                        <PfpResolver
                                            address={postData.author.address}
                                            imgUrl={postData.author.image}
                                            height="100px"
                                            width="100px"
                                            fontSize="1rem"
                                        />
                                    </Col>
                                    <Col className="col-auto">
                                        <h5>
                                            <AuthorAddress address={postData.author.address} />
                                        </h5>
                                        <p>
                                            {formatTimeAgo(
                                                getTimeAgo(postData.created, datetimeOpts)
                                            )}
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Header>

                            {/* Card body that includes the post details. */}
                            {(postData.text !== "" || postData.imgUrl !== "" ) && 
                            <Card.Body>
                                <Row>
                                    <Col className="col-auto">
                                        {postData.imgUrl !== "" && <Card.Img src={postData.imgUrl} />}
                                        <Card.Text>
                                            <MentionsOutput
                                                text={postData.text}
                                            />
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Card.Body>
                            }

                            {/* Card body that includes the transaction details. */}
                            {/* ERC20 Transfer */}
                            {(txType === txTypes.ERC20Transfer && erc20Transfers.length > 0) &&
                             <ERC20Post
                                author={postData.author.address}
                                transfers={erc20Transfers}
                                txHash={postData.refTx.tx_hash}
                             />
                            }

                            {/* ERC721 Transfer */}
                            {(txType === txTypes.ERC721Transfer && erc721Transfers.length > 0) && 
                             <ERC721Post
                                author={postData.author.address}
                                transfers={erc721Transfers}
                             />
                            }

                            {/* All other Transactions */}
                            {txType === txTypes.Transaction &&
                            <Card.Body>
                                <Row>
                                    <Col className="col-auto">
                                        <Card.Text>
                                            Sent a&nbsp;
                                            <a
                                                className="text-success"
                                                href={`https://etherscan.io/tx/${postData.refTx.tx_hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontStyle: 'italic', color: 'black' }}
                                            >
                                                transaction
                                            </a>
                                            {postData.refTx.value !== "0" && <span>&nbsp;worth {formatTokenAmount(postData.refTx.value, 18)} ETH</span>}
                                            &nbsp;to&nbsp; 
                                            <TxAddress address={postData.refTx["to_address"]} />
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Card.Body>
                            }

                            {/* Card footer that includes the action buttons. */}
                            <Card.Footer>
                                <Row className="justify-content-around align-items-center">

                                    {/* Like button */}
                                    <Col className="col-auto">
                                        <Button
                                            size="sm"
                                            variant={
                                                postData["likedByMe"] === true
                                                    ? "outline-danger"
                                                    : "light"
                                            }
                                            onClick={() => handleLikeClick()}
                                            style={{
                                                color: postData.numLikes > 0 ? "#dc3545" : ""
                                            }}
                                        >
                                            {postData.numLikes}&nbsp;&nbsp;
                                            <FontAwesomeIcon icon={faHeart} />
                                        </Button>
                                    </Col>

                                    {/* Comment button */}
                                    <Col className="col-auto">
                                        <Button
                                            size="sm"
                                            variant="light"
                                            onClick={() => {navigate(`/posts/${postData.id}`)}}
                                            style={{
                                                color: postData.numComments > 0 ? "#0d6efd" : ""
                                            }}
                                        >
                                            {postData.numComments}&nbsp;&nbsp;
                                            <FontAwesomeIcon icon={faComment} />
                                        </Button>
                                    </Col>

                                    {/* Repost button and Confirmation */}
                                    <Col className="col-auto">
                                        {/* confirmation popover */}
                                        <OverlayTrigger
                                            trigger="click"
                                            rootClose={true}
                                            placement="right"
                                            overlay={
                                                <Popover>
                                                    <Popover.Body>
                                                        {/* Confirm button */}
                                                        <Button
                                                            variant="success"
                                                            onClick={() => handleRepostClick()}
                                                        >
                                                            Confirm
                                                        </Button>
                                                    </Popover.Body>
                                                </Popover>
                                            }
                                        >
                                            {/* Repost button */}
                                            <Button
                                                size="sm"
                                                ref={repostRef}
                                                variant={
                                                    postData["repostedByMe"] === true
                                                        ? "secondary"
                                                        : "light"
                                                }
                                                style={{
                                                    color: postData.numReposts > 0 ? "#00a8e8" : ""
                                                }}
                                            >
                                                {postData.numReposts}&nbsp;&nbsp;
                                                <FontAwesomeIcon icon={faRetweet} />
                                            </Button>
                                        </OverlayTrigger>
                                    </Col>

                                </Row>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>

                
            </Container>
        )
    }

    return render();
}

export default Post;
