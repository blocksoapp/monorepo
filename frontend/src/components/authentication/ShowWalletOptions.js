import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import WalletOptions from './Wallets';

function ShowWalletOptions() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow} className="me-2">
        Connect
      </Button>
      <Offcanvas show={show} onHide={handleClose} placement='end'>
        <Offcanvas.Header closeButton className='border-bottom'>
          <Offcanvas.Title>My Wallet</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <p className='fs-5'>If you don't have a wallet yet, you can select a provider and create one now.</p>
          <WalletOptions/>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default ShowWalletOptions