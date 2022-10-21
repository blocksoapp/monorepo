import { useEffect, useState } from "react";
import { 
    Button,
    Container,
    Card,
    Col,
    Image,
    Row 
} from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom";
import { useEnsAvatar, useEnsName } from "wagmi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faRetweet, faQuoteRight, faComment  } from '@fortawesome/free-solid-svg-icons'
import { utils } from "ethers";
import Pfp from '../Pfp';
import TxAddress from "../TxAddress";
import Comment from "./Comment";
import NewComment from "./NewComment";


function Post(props) {
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
    const refTx = props.refTx;
    const navigate = useNavigate();
    const ensAvatar = useEnsAvatar({addressOrName: props.author});
    const ensNameHook = useEnsName({address: props.author});
    const [pfpUrl, setPfpUrl] = useState(props.pfp)
    const [erc20Transfers, setErc20Transfers] = useState([]);
    const [erc721Transfers, setErc721Transfers] = useState([]);
    const [txType, setTxType] = useState(null);
    const [ensName, setEnsName] = useState(props.ensName);
    const [comments, setComments] = useState(props.comments);
    const [showComments, setShowComments] = useState(false);

    // functions
    const submitCommentCallback = (newComment) => {
        if (comments !== undefined) {
            setComments([newComment].concat(comments));
        }
        else {
            setComments([newComment]);
        }
    }

    // TODO this will be adjusted in the future to deal
    // with more complex transactions
    const determineTxType = function() {
        // return if there is no ref tx
        if (refTx === null) return

        // ERC20 transfer
        if (refTx.erc20_transfers.length > 0) {
            setErc20Transfers(refTx.erc20_transfers);
            setTxType(txTypes.ERC20Transfer);
        }

        // ERC721 transfer
        else if (refTx.erc721_transfers.length > 0) {
            setErc721Transfers(refTx.erc721_transfers);
            setTxType(txTypes.ERC721Transfer);
        }

        // all other transactions
        else {
            setTxType(txTypes.Transaction);
        }
    }

    /* 
     * Formats token amount with decimal places.
     */
    const formatTokenAmount = function(amount, decimals) {
        return utils.formatUnits(amount, decimals);
    }

    /* 
     * Determines tx type on component mount.
     */
    useEffect(() => {
        determineTxType();
    }, [])

    /* 
     * Sets the user's ens name if it has not been passed in from props.
     */
    useEffect(() => {
        if (!ensName) {
            if (!ensNameHook.isLoading && ensNameHook.data !== null) {
                setEnsName(ensNameHook.data);
            }
        }
    }, [ensNameHook])

    /* 
     * Sets the user's pfp to their ens avatar,
     * if the user has not uploaded a profile pic.
     */
    useEffect(() => {
        if (!pfpUrl) {
            if (!ensAvatar.isLoading && ensAvatar.data !== null) {
                setPfpUrl(ensAvatar.data);
            }
        }
    }, [ensAvatar])


    const render = function () {
        const dateObj = new Date(props.created);

        // do not render spammy txs
        if (erc20Transfers.length > 10 || erc721Transfers.length > 10) return

        return (
            <Container className="mt-4">
                <Row className="justify-content-center mb-4">
                    <Col xs={12} lg={6}>
                        <Card>
                            {/* Card header that includes pfp, address, created time. */}
                            <Card.Header>
                                <Row className="align-items-end">
                                    <Col className="col-auto">
                                        <Pfp
                                            height="100px"
                                            width="100px"
                                            imgUrl={pfpUrl}
                                            address={props.author}
                                            ensName={ensName}
                                            fontSize="1rem"
                                        />
                                    </Col>
                                    <Col className="col-auto">
                                        <h5>
                                            <TxAddress
                                                address={props.author}
                                                profileAddress={props.profileAddress}
                                            />
                                        </h5>
                                        <p>
                                            {dateObj.toLocaleDateString("en-US", datetimeOpts)}
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Header>

                            {/* Card body that includes the post details. */}
                            {(props.text !== "" || props.imgUrl !== "" ) && 
                            <Card.Body>
                                <Row>
                                    <Col className="col-auto">
                                        {props.imgUrl !== "" && <Card.Img src={props.imgUrl} />}
                                        <Card.Text>
                                            {props.text}
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Card.Body>
                            }

                            {/* Card body that includes the transaction details. */}
                            {/* ERC20 Transfer */}
                            {txType === txTypes.ERC20Transfer &&
                            <Card.Body>
                                {/* show all transfers of a transaction */}
                                {/* TODO improve hacky way of skipping spam which is currently checking if there are more than 10 transfers */}
                                {erc20Transfers.map(transfer => (
                                    <Row className="align-items-end">
                                        {/* token image */}
                                        <Col className="col-auto">
                                            <Image
                                                src={transfer.logo_url}
                                                height="25px"
                                                width="25px"
                                                roundedCircle
                                            />
                                        </Col>

                                        {/* transfer details */}
                                        <Col className="col-auto">
                                            <Card.Text className="text-wrap">
                                                <TxAddress
                                                    address={transfer.from_address}
                                                    profileAddress={props.profileAddress}
                                                />
                                                &nbsp;sent&nbsp;
                                                <a
                                                    className="text-success"
                                                    href={`https://etherscan.io/tx/${props.refTx.tx_hash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ fontStyle: 'italic', color: 'black' }}
                                                >
                                                    {formatTokenAmount(transfer.amount, transfer.decimals)} {transfer.contract_ticker}
                                                </a>
                                                &nbsp;to&nbsp;
                                                <TxAddress
                                                    address={transfer.to_address}
                                                    profileAddress={props.profileAddress}
                                                />
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                ))}
                            </Card.Body>
                            }

                            {/* ERC721 Transfer */}
                            {txType === txTypes.ERC721Transfer && 
                            <Card.Body>
                                {/* show all transfers of a transaction */}
                                {/* TODO improve hacky way of skipping spam which is currently checking if there are more than 10 transfers */}
                                {erc721Transfers.map(transfer => (
                                    <Row>
                                        {/* nft transfer details */}
                                        <Col className="col-auto">
                                            <Card.Text>
                                                <TxAddress
                                                    address={transfer.from_address}
                                                    profileAddress={props.profileAddress}
                                                />
                                                &nbsp;sent&nbsp;
                                                <a
                                                    className="text-success"
                                                    href={`https://opensea.io/assets/ethereum/${transfer.contract_address}/${transfer.token_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ fontStyle: 'italic', color: 'black' }}
                                                >
                                                    {transfer.contract_ticker} #{transfer.token_id}
                                                </a>
                                                &nbsp;to&nbsp;
                                                <TxAddress
                                                    address={transfer.to_address}
                                                    profileAddress={props.profileAddress}
                                                />
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                ))}
                            </Card.Body>
                            }

                            {/* All other Transactions */}
                            {txType === txTypes.Transaction &&
                            <Card.Body>
                                <Row>
                                    <Col className="col-auto">
                                        <Card.Text>
                                            <TxAddress
                                                address={props.refTx["from_address"]}
                                                profileAddress={props.profileAddress}
                                            />
                                            &nbsp;sent a&nbsp;
                                            <a
                                                className="text-success"
                                                href={`https://etherscan.io/tx/${props.refTx.tx_hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontStyle: 'italic', color: 'black' }}
                                            >
                                                transaction
                                            </a>
                                            {props.refTx.value !== "0" && <span>&nbsp;worth {formatTokenAmount(props.refTx.value, 18)} ETH</span>}
                                            &nbsp;to&nbsp; 
                                            <TxAddress
                                                address={props.refTx["to_address"]}
                                                profileAddress={props.profileAddress}
                                            />
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Card.Body>
                            }


                            {/* Comments section of a Post */}
                            {/* hidden until user presses comment button */}
                            {showComments === true &&
                                <Card.Body className="bg-light">
                                    <Row>
                                        {comments && comments.map(comment => (
                                            <Comment
                                                key={comment["id"]}
                                                author={comment["author"]}
                                                text={comment["text"]}
                                                imgUrl={comment["imgUrl"]}
                                                created={comment["created"]}
                                                profileAddress={props.profileAddress}
                                            />
                                        ))}

                                        <NewComment
                                            profileData={{profile: {address: props.profileAddress, image: props.profileImg}}}
                                            submitCommentCallback={submitCommentCallback}
                                            postId={props.id}
                                        />
                                    </Row>
                                </Card.Body>
                            }

                            {/* Card footer that includes the action buttons. */}
                            <Card.Footer>
                                <Row className="justify-content-around align-items-center">
                                    <Col className="col-auto border-end border-3">
                                        <span className="text-muted">Coming Soon</span>
                                    </Col>
                                    <Col className="col-auto">
                                        <Button size="sm" variant="light"><FontAwesomeIcon icon={faHeart} /></Button>
                                    </Col>
                                    <Col className="col-auto">
                                        <Button size="sm" variant="light"><FontAwesomeIcon icon={faRetweet} /></Button>
                                    </Col>
                                    <Col className="col-auto">
                                        <Button size="sm" variant="light"><FontAwesomeIcon icon={faQuoteRight} /></Button>
                                    </Col>
                                    <Col className="col-auto">
                                        <Button
                                            size="sm"
                                            variant="light"
                                            onClick={() => {navigate(`/posts/${props.id}`)}}
                                        >
                                            <FontAwesomeIcon icon={faComment} />
                                        </Button>
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
