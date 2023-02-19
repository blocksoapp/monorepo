import { useState } from "react";
import { Card, Col, Image, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { formatTokenAmount, zeroAddress } from "../../utils";
import TxAddress from "../TxAddress";
import EtherscanLogo from "../../assets/img/etherscan.svg";


function ERC20Post({author, transfers, txHash}) {

    // state
    const [tokenImgError, setTokenImgError] = useState(false);


    return (
        transfers.length > 0 &&
        <Card.Body>

            {/* link to view on etherscan */}
            <Row className="justify-content-end fs-6">
                <Col className="col-auto">
                    <a href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={EtherscanLogo}
                            height="20px"
                            width="20px"
                            className="mx-2"
                        />
                    </a>
                </Col>
            </Row>

            {/* card body details, shows token transfer and recipient */}
            {transfers.map((transfer, index) => (
                <div key={index}>

                    {/* transfer in/out arrow */}
                    <Row className="justify-content-center my-2">
                        <Col className="col-auto">
                            {transfer.from_address.toLowerCase() === author.toLowerCase() &&
                                <FontAwesomeIcon icon={faArrowUp} size="xl" />}

                            {transfer.to_address.toLowerCase() === author.toLowerCase() &&
                                <FontAwesomeIcon icon={faArrowDown} size="xl" />}
                        </Col>
                    </Row>

                    {/* token image */}
                    <Row className="justify-content-center my-3">
                        <Col className="col-auto">
                            {/* if token image is not found, show default token image */}
                            {tokenImgError
                                ?   <Card
                                        className="rounded-circle text-center justify-content-center"
                                        style={{
                                            height: "50px",
                                            width: "50px",
                                            backgroundColor: `#414141`,
                                            color: "white",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {transfer.contract_ticker}
                                    </Card>
                                :   <Image
                                        src={transfer.logo_url}
                                        onError={() => setTokenImgError(true)}
                                        className="mx-3"
                                        height="50px"
                                        width="50px"
                                        roundedCircle
                                    />
                            }
                        </Col>
                    </Row>

                    <Row className="justify-content-center text-center mt-4 mb-2 fs-5">
                        {/* transfer details */}

                        {/* minted from zero address */}
                        {(transfer.from_address === zeroAddress &&
                            transfer.to_address.toLowerCase() === author.toLowerCase()) &&
                            <Col className="col-auto">
                                <span>Minted&nbsp;
                                    {formatTokenAmount(transfer.amount, transfer.decimals)} {transfer.contract_ticker}
                                </span>
                            </Col>
                        }

                        {/* burned to zero address */}
                        {(transfer.to_address === zeroAddress &&
                            transfer.from_address.toLowerCase() === author.toLowerCase()) &&
                            <Col className="col-auto">
                                <span>Burned&nbsp;
                                    {formatTokenAmount(transfer.amount, transfer.decimals)} {transfer.contract_ticker}
                                </span>
                            </Col>
                        }

                        {/* received by post author */}
                        {(transfer.to_address.toLowerCase() === author.toLowerCase() &&
                            transfer.from_address !== zeroAddress) &&
                            <Col className="col-auto">
                                <span>Received&nbsp;
                                    {formatTokenAmount(transfer.amount, transfer.decimals)} {transfer.contract_ticker}
                                    &nbsp;from&nbsp;
                                    <TxAddress address={transfer.from_address} />
                                </span>
                            </Col>
                        }

                        {/* sent by post author */}
                        {(transfer.from_address.toLowerCase() === author.toLowerCase() &&
                            transfer.to_address !== zeroAddress) &&
                            <Col className="col-auto">
                                <span>Sent&nbsp;
                                    {formatTokenAmount(transfer.amount, transfer.decimals)} {transfer.contract_ticker}
                                    &nbsp;to&nbsp;
                                    <TxAddress address={transfer.to_address} />
                                </span>
                            </Col>
                        }

                        {/* neither sent not received by post author */}
                        {(transfer.from_address.toLowerCase() !== author.toLowerCase() &&
                            transfer.to_address.toLowerCase() !== author.toLowerCase()) &&
                            <Col className="col-auto">
                                <span>
                                    {formatTokenAmount(transfer.amount, transfer.decimals)} {transfer.contract_ticker}
                                    &nbsp;from&nbsp;
                                    <TxAddress address={transfer.from_address} />
                                    &nbsp;to&nbsp;
                                    <TxAddress address={transfer.to_address} />
                                </span>
                            </Col>
                        }
                    </Row>
                </div>
            ))}

        </Card.Body>
    )
}

export default ERC20Post;
