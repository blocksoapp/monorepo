import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import MainHeader from "../components/ui/MainHeader";
import { apiGetNotifications } from "../api";
import "../components/notifications/styles.css";
import NotificationPageItem from "../components/notifications/NotificationPageItem";

function Notifications() {
  // state
  const [notifs, setNotifs] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [notifsError, setNotifsError] = useState(false);
  /*
   * Fetches the notifications of the authenticated user.
   */
  const fetchNotifications = async () => {
    setNotifsLoading(true);
    const resp = await apiGetNotifications();

    if (resp.status === 200) {
      const data = await resp.json();
      setNotifs(data["results"]);
      setNotifsError(false);
      setNotifsLoading(false);
    } else {
      setNotifsError(true);
      setNotifsLoading(false);
      console.error(resp);
    }
  };

  // fetch notifications on first render
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Container className="">
      <MainHeader header="Notifications" />
      {/* Loading notifications */}
      {notifsLoading && (
        <div className="p-3">
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      )}
      {/* Error fetching notifications. */}
      {notifsError && (
        <div className="p-3">
          <div className="d-flex justify-content-center">
            <p className="text-muted">Failed to load notifications.</p>
          </div>
        </div>
      )}
      {/* No notifications. */}
      {notifs.length < 0 && !notifsLoading && !notifsError && (
        <div className="p-3">
          <div className="d-flex justify-content-center">
            <p className="text-muted">No notifications.</p>
          </div>
        </div>
      )}
      {/* Show notifications here. */}
      {notifs.length > 0 && !notifsLoading && !notifsError && (
        <Container className="notifications">
          <p className="notif-header">Latest</p>
          {notifs.map((notif, index) => (
            <NotificationPageItem key={index} data={notif} />
          ))}
        </Container>
      )}
    </Container>
  );
}

export default Notifications;
