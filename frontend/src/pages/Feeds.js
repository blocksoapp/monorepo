import FeedsFollowedByMe from "../components/feed/FeedsFollowedByMe";
import NewestFeeds from "../components/feed/NewestFeeds";


function Feeds() {

    return (
        <div>
            <h3 className="display-6 my-5 text-center text-muted">Feeds I Follow</h3>
            <FeedsFollowedByMe />
            <h3 className="display-6 my-5 text-center text-muted">Newest Feeds</h3>
            <NewestFeeds />
        </div>
    )
}


export default Feeds;
