import React from 'react';
import {Nav, Navbar} from "react-bootstrap";
import {Link} from "react-router-dom";

export default class NavBar extends React.Component<{}, {  }> {
    render() {

        return (
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand as={Link} to="/">{window.APP_CONFIG.title}</Navbar.Brand>

                <Nav className="mr-auto">

                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="/about">About</Nav.Link>

                </Nav>

            </Navbar>
        );
    }
}