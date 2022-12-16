import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import EnsAndAddress from "../../EnsAndAddress.js";
import PfpResolver from "../../PfpResolver";


function RepostEvent({data, setHref}) {

    // constants
    const href = `/posts/${data.repost}`;

    // effects
    useEffect(() => {
        setHref(href);
    }, []);

    return (
        <Container>
            <Row className="align-items-center">
                {/* avatar */}
                <Col xs={2}>
                    <PfpResolver
                        address={data.repostedBy.address}
                        imgUrl={data.repostedBy.image}
                        height="40px"
                        width="40px"
                        fontSize="0.5rem"
                    />
                </Col>

                {/* event description */}
                <Col xs={10} className="ps-3">
                    <span>
                        <EnsAndAddress address={data.repostedBy.address} />
                        &nbsp;reposted you!
                    </span>
                </Col>
            </Row>
        </Container>
    )
}


export default RepostEvent;
