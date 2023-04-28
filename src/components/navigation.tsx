import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import {Container, Nav, Navbar, NavLink} from "react-bootstrap";
import Link from "next/link";

export default function NavigationBar() {
    return (
        <Navbar bg="primary" variant="dark" expand="lg">
            <Container>
                <Link href="/" passHref legacyBehavior><Navbar.Brand href="/">Developer Tools</Navbar.Brand></Link>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Link href="/" passHref legacyBehavior><NavLink>Home</NavLink></Link>
                        <Link href="/string" passHref legacyBehavior><NavLink>String Utils</NavLink></Link>
                        <Link href="/json" passHref legacyBehavior><NavLink>Json Utils</NavLink></Link>
                        <Link href="/git" passHref legacyBehavior><NavLink>Git Utils</NavLink></Link>
                        <Link href="/terminal" passHref legacyBehavior><NavLink>Terminal Utils</NavLink></Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}