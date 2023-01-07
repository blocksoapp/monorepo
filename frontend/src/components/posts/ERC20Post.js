import { Card, Col, Image, Row } from "react-bootstrap";
import { formatTokenAmount, zeroAddress } from "../../utils";
import TxAddress from "../TxAddress";


function ERC20Post({author, transfers, txHash}) {

    // state

    return (
        transfers.length > 0 &&
        <Card.Body>

            {/* card body details, shows token transfer and recipient */}
            {transfers.map((transfer, index) => (
                <Row key={index} className="align-items-end mb-2">
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

                    {/* minted from zero address */}
                    {(transfer.from_address === zeroAddress &&
                        transfer.to_address === author.toLowerCase()) &&
                        <Col className="col-auto">
                            <span>Minted&nbsp;
                                {formatTokenAmount(transfer.amount, transfer.decimals)} {transfer.contract_ticker}
                            </span>
                        </Col>
                    }

                    {/* burned to zero address */}
                    {(transfer.to_address === zeroAddress &&
                        transfer.from_address === author.toLowerCase()) &&
                        <Col className="col-auto">
                            <span>Burned&nbsp;
                                {formatTokenAmount(transfer.amount, transfer.decimals)} {transfer.contract_ticker}
                            </span>
                        </Col>
                    }

                    {/* received by post author */}
                    {(transfer.to_address === author.toLowerCase() &&
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
                    {(transfer.from_address === author.toLowerCase() &&
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
                    {(transfer.from_address !== author.toLowerCase() &&
                        transfer.to_address !== author.toLowerCase()) &&
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
            ))}

            {/* show link to view on etherscan if it is a complex transaction */}
            {transfers.length > 1 &&
             <Row className="mt-3 text-center">
                <a href={`https://etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "underline 1px dotted", color: "black" }}>
                    View on Etherscan
                </a>
             </Row>}
        </Card.Body>
    )
}

export default ERC20Post;
