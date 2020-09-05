import React from 'react';
import Navbar from 'react-bootstrap/Navbar';

function NavbarSection(props) {
      
    return (
    <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#home">DocuSign JSON to SDK tool</Navbar.Brand>
    </Navbar>
    )
}

export default NavbarSection;
