import { useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useUser } from "./hooks/useUser";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import EditProfile from "./pages/EditProfile";
import ViewProfile from "./pages/ViewProfile";
import Feeds from "./pages/Feeds";
import EditFeed from "./components/feed/write/EditFeed";
import ViewFeed from "./components/feed/read/ViewFeed";
import PostPage from "./pages/PostPage";
import NavbarComponent from "./components/ui/Navbar";
import FeedFollow from "./pages/FeedFollow";
import Follow from "./pages/Follow";
import SideNavbar from "./components/ui/sidenavbar/SideNavbar";
import SideContent from "./components/sidecontent/SideContent";
import Notifications from "./pages/Notifications";

function App(props) {
    // constants
    const { user } = useUser();

  return (
      <Container fluid="md">
          <Router>
            <NavbarComponent />
            <Row>
              {/* side navbar */}
              <Col className="side-navbar pt-2">
                {/* make sidenavbar hide at 987px and below */}
                <SideNavbar />
              </Col>
              {/* main content */}
              <Col className="main-content pt-2">
                <Routes>
                  {user !== null ? (
                    <Route path="/" element={<Home />}></Route>
                  ) : (
                    <Route path="/" element={<Explore />}></Route>
                  )}
                  <Route path="/home" element={<Home />}></Route>
                  <Route path="/explore" element={<Explore />}></Route>
                  <Route path="/edit-profile" element={<EditProfile />}></Route>
                  <Route
                    path="/notifications"
                    element={<Notifications />}
                  ></Route>
                  <Route
                    path="/feeds/:feedId/edit"
                    element={<EditFeed />}
                  ></Route>
                  <Route
                    path="/feeds/:feedId/follow"
                    element={<FeedFollow />}
                  ></Route>
                  <Route path="/feeds/:feedId" element={<ViewFeed />}></Route>
                  <Route path="/feeds" element={<Feeds />}></Route>
                  <Route
                    path="/:urlInput/profile/"
                    element={<ViewProfile />}
                  ></Route>
                  <Route path="/posts/:postId" element={<PostPage />}></Route>
                  <Route
                    path="/:urlInput/profile/follow"
                    element={<Follow />}
                  ></Route>
                </Routes>
              </Col>
              <Col className="side-content pt-2">
                {/* make sidecontent hide at 987px and below */}
                <SideContent />
              </Col>
            </Row>
          </Router>
      </Container>
  );
}

export default App;
