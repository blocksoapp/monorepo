import { Badge, Container, Row, Col } from 'react-bootstrap';
import useBreakpoint from "../../hooks/useBreakpoint";
import TxAddress from '../TxAddress';
import FeedPfp from './FeedPfp';
import FeedFollowersFollowingBadges from './FeedFollowersFollowingBadges';
import FeedOptions from './FeedOptions';


function FeedDetails({feed}) {
    // hooks
    const breakpoint = useBreakpoint();

    // render
    return (
        <Container>
            <Row
                className={ (breakpoint === "lg" || breakpoint === "xl" || breakpoint === "xxl")
                    ? "justify-content-center align-items-center"
                    : "align-items-center"
                }
            >

                {/* Feed Pfp */}
                <Col xs="auto">
                    <FeedPfp
                        imgUrl={feed.image}
                        height={
                            breakpoint === "xs" 
                                ? 100
                                : 150
                        }
                        width={
                            breakpoint === "xs" 
                                ? 100
                                : 150
                        }
                    />
                </Col>

                {/* Feed Details */}
                <Col xs="auto p-3" sm="auto px-3">
                    <Row>
                        {/* Feed Name */}
                        <Col xs="auto">
                            <p className="fs-2 mb-0">{feed.name}</p>
                        </Col>

                        {/* Feed Options */}
                        <Col className="col-auto">
                            <FeedOptions feed={feed} />
                        </Col>
                    </Row>

                    {/* Feed Owner */}
                    <p className="text-muted">
                        <small>Created by {<TxAddress address={feed.owner.address} />}</small>
                    </p>

                    {/* Feed Description */}
                    <p className="my-3">{feed.description}</p>

                    {/* Feed followers/following */}
                    <FeedFollowersFollowingBadges feed={feed} />
                </Col> 

            </Row>
        </Container>
    );
}


export default FeedDetails;
