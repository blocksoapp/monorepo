import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import EnsAndAddress from "../EnsAndAddress.js";
import PfpResolver from "../PfpResolver";


function FollowedEvent({data, setHref}) {

    // constants
    const href = `/${data.followedBy.address}/profile/`;

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
                        address={data.followedBy.address}
                        imgUrl={data.followedBy.image}
                        height="40px"
                        width="40px"
                        fontSize="0.5rem"
                    />
                </Col>

                {/* event description */}
                <Col xs={10} className="ps-3">
                    <span>
                        <EnsAndAddress address={data.followedBy.address} />
                        &nbsp;started following you!
                    </span>
                </Col>
            </Row>
        </Container>
    )
}


export default FollowedEvent;
