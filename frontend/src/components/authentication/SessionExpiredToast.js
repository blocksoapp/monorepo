import React, { useContext } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { ConnectKitButton } from "connectkit";
import { UserContext } from "../../contexts/UserContext";

function SessionExpiredToast(props) {
  const { isAuthenticated } = useContext(UserContext);
  return (
    <>
      {props.isToggle ? (
        <ToastContainer position="top-end" className="p-3">
          <Toast show={props.isToggle} onClose={() => props.setIsToggle(false)}>
            <Toast.Header>
              <strong className="me-auto">Session Expired</strong>
            </Toast.Header>
            <Toast.Body>
              Your session has timed out. Please sign in again.{" "}
              <ConnectKitButton />
            </Toast.Body>
          </Toast>
        </ToastContainer>
      ) : (
        ""
      )}
    </>
  );
}

export default SessionExpiredToast;
