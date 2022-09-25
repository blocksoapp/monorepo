import { useEffect, useState } from "react";
import { 
    Button,
    Container,
    Card,
    Col,
    Image,
    Row 
} from "react-bootstrap"
import { Link } from "react-router-dom";
import { useEnsAvatar } from "wagmi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faRetweet, faQuoteRight, faComment  } from '@fortawesome/free-solid-svg-icons'
import { BigNumber } from "ethers";
import EnsAndAddress from "./ensName.js";
import Blockies from 'react-blockies';


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
    const [erc20Transfers, setErc20Transfers] = useState([]);
    const [erc721Transfers, setErc721Transfers] = useState([]);
    const [txType, setTxType] = useState(null);
    const ensAvatar = useEnsAvatar({addressOrName: props.author});
    const [pfpUrl, setPfpUrl] = useState(null);

    // functions

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
     * Sets the user's pfp to their ens avatar,
     * if the user has not uploaded a profile pic.
     * Returns null if the user does not have an
     * ens avatar. That way a blockie will be
     * displayed instead.
     */
    const determineProfilePic = (pfp) => {
        // if no image url was passed in
        if (pfp === null || pfp === undefined) {
            // if user has an ens avatar then use it
            if (ensAvatar["data"] !== null) {
                setPfpUrl(ensAvatar["data"]);
            }
        }
    }


    const formatTokenAmount = function(amount, decimals) {
        var amount = BigNumber.from(amount);
        var decimals = BigNumber.from(10).pow(decimals);
        var result = amount.div(decimals);
        return result.toString();
    }

    // determine tx type on component mount
    useEffect(() => {
        determineTxType();
        determineProfilePic(props.pfp);
    }, [])

    useEffect(() => {
        if (pfpUrl !== null && pfpUrl !== undefined && pfpUrl !== "") {
            return;
        }

        if (pfpUrl === ensAvatar["data"]) {
            return;
        }
        if (ensAvatar["data"] !== "") {
            setPfpUrl(ensAvatar["data"]);
        }
    }, [pfpUrl])


    const render = function () {
        const dateObj = new Date(props.created);

        return (
            <Container className="mt-4">
                {erc20Transfers.length <= 10 &&
                <Row className="justify-content-center">
                    <Col xs={12} lg={6}>
                        <Card>
                            {/* Card header that includes pfp, address, created time. */}
                            <Card.Header>
                                <Row className="align-items-end">
                                    <Col className="col-auto">
                                        {pfpUrl === null
                                        ? <Blockies
                                            seed={props.author}
                                            size={15}
                                            scale={5}
                                            className="rounded-circle"
                                            color="#ff5412"
                                            bgColor="#ffb001"
                                            spotColor="#4db3e4"
                                          />
                                        : <Image
                                            src={pfpUrl}
                                            height="100px"
                                            width="100px"
                                            roundedCircle
                                          />
                                        }
                                    </Col>
                                    <Col className="col-auto">
                                        <h5><EnsAndAddress address={props.author} /></h5>
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
                                {erc20Transfers.length <= 10 && erc20Transfers.map(transfer => (
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
                                                <Link to={`/${transfer.from_address}/profile`}  style={{ fontStyle: 'italic', textDecoration: 'none', color: 'black' }}>
                                                    <EnsAndAddress address={transfer.from_address} />
                                                </Link>
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
                                                <Link to={`/${transfer.to_address}/profile`} style={{ fontStyle: 'italic', textDecoration: 'none', color: 'black' }}>
                                                    <EnsAndAddress address={transfer.to_address} />
                                                </Link>
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                ))}
                                {/* show different text for long/spammy tx */}
                                {erc20Transfers.length > 10 &&
                                <Row>
                                    <Col className="col-auto">
                                        <Card.Text>
                                            <Link to={`/${erc20Transfers[0].from_address}/profile`}  style={{ fontStyle: 'italic', textDecoration: 'none', color: 'black' }}>
                                                <EnsAndAddress address={erc20Transfers[0].from_address} />
                                            </Link>
                                            &nbsp;sent&nbsp;
                                            <a
                                                className="text-danger"
                                                href={`https://etherscan.io/tx/${props.refTx.tx_hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontStyle: 'italic', color: 'black' }}
                                            >
                                                {formatTokenAmount(erc20Transfers[0].amount, erc20Transfers[0].decimals)} {erc20Transfers[0].contract_ticker}
                                            </a>
                                            &nbsp;to&nbsp;
                                            <Link to={`/${erc20Transfers[0].to_address}/profile`} style={{ fontStyle: 'italic', textDecoration: 'none', color: 'black' }}>
                                                <EnsAndAddress address={erc20Transfers[0].to_address} />
                                            </Link>
                                            <br />
                                            Note: this transaction seems spammy.
                                        </Card.Text>
                                    </Col>
                                </Row>
                                }

                            </Card.Body>
                            }

                            {/* ERC721 Transfer */}
                            {txType === txTypes.ERC721Transfer &&
                            <Card.Body>
                                {/* show all transfers of a transaction */}
                                {erc721Transfers.map(transfer => (
                                    <Row>
                                        {/* nft transfer details */}
                                        <Col className="col-auto">
                                            <Card.Text>
                                                <Link to={`/${transfer.from_address}/profile`}  style={{ fontStyle: 'italic', textDecoration: 'none', color: 'black' }}>
                                                    <EnsAndAddress address={transfer.from_address} />
                                                </Link>
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
                                                <Link to={`/${transfer.to_address}/profile`} style={{ fontStyle: 'italic', textDecoration: 'none', color: 'black' }}>
                                                    <EnsAndAddress address={transfer.to_address} />
                                                </Link>
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
                                            <Link to={`/${props.refTx["from_address"]}/profile`}  style={{ fontStyle: 'italic', textDecoration: 'none', color: 'black' }}>
                                                <EnsAndAddress address={props.refTx.from_address} />
                                            </Link>
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
                                            <Link to={`/${props.refTx.to_address}/profile`} style={{ fontStyle: 'italic', textDecoration: 'none', color: 'black' }}>
                                                <EnsAndAddress address={props.refTx.to_address} />
                                            </Link>
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Card.Body>
                            }

                            {/* Card footer that includes the action buttons. */}
                            <Card.Footer>
                                <Row className="justify-content-around">
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
                                        <Button size="sm" variant="light"><FontAwesomeIcon icon={faComment} /></Button>
                                    </Col>
                                </Row>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
                }
            </Container>
        )
    }

    return render();
}

export default Post;
