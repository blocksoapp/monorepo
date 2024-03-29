import { Badge, Container, Row, Col } from "react-bootstrap";
import useBreakpoint from "../../../hooks/useBreakpoint";
import TxAddress from "../../TxAddress";
import FeedPfp from "./FeedPfp";
import FeedFollowersFollowingBadges from "./FeedFollowersFollowingBadges";
import FeedOptions from "./FeedOptions";

function FeedDetails({ feed, inEditFeed, inThumbnail }) {
  // hooks
  const breakpoint = useBreakpoint();

  // render
  return (
    <Container>
      <Row
        className={
          breakpoint === "xs" || breakpoint === "sm" || breakpoint === "md"
            ? "align-items-center"
            : inEditFeed
            ? "justify-content-start align-items-center"
            : "justify-content-center align-items-center"
        }
      >
        {/* Feed Pfp */}
        <Col xs="auto">
          <FeedPfp
            imgUrl={feed.image}
            height={breakpoint === "xs" ? 48 : 133.5}
            width={breakpoint === "xs" ? 48 : 133.5}
          />
        </Col>

        {/* Feed Details */}
        <Col xs="auto p-3" sm="auto px-3">
          <Row className="align-items-center">
            {/* Feed Name */}
            <Col xs="auto">
              <p className="fs-2 mb-0">
                {inThumbnail
                  ? feed.name.length > 14
                    ? `${feed.name.substring(0, 14)}...`
                    : feed.name
                  : feed.name}
              </p>
            </Col>

            {/* Feed Options */}
            {!inEditFeed && (
              <Col className="col-auto">
                <FeedOptions feed={feed} />
              </Col>
            )}
          </Row>

          {/* Feed Owner */}
          <p className="text-muted">
            <small>
              Created by {<TxAddress address={feed.owner.address} />}
            </small>
          </p>

          {/* Feed Description */}
          <p className="my-3">
            {inThumbnail
              ? feed.description.length > 40
                ? `${feed.description.substring(0, 40)}...`
                : feed.description
              : feed.description}
            &nbsp;
          </p>

          {/* Feed followers/following */}
          <FeedFollowersFollowingBadges feed={feed} />
        </Col>
      </Row>
    </Container>
  );
}

export default FeedDetails;
