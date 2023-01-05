import React, { useContext } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { ConnectKitButton } from "connectkit";
import { UserContext } from "../../contexts/UserContext";

function ToastComponent(props) {
  return (
    <>
      {props.isToggle ? (
        <ToastContainer position="top-end" className="p-3">
          <Toast show={props.isToggle} onClose={() => props.setIsToggle(false)}>
            <Toast.Header>
              <strong className="me-auto">{props.heading}</strong>
            </Toast.Header>
            <Toast.Body>
              {props.body} <ConnectKitButton />
            </Toast.Body>
          </Toast>
        </ToastContainer>
      ) : (
        ""
      )}
    </>
  );
}

export default ToastComponent;
