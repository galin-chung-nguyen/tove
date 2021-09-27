import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import '../assets/css/Header.scss';

let Header = () => {
    let state = useSelector(state => state.userInfo);
    let dispatch = useDispatch();

    //console.log(state)
    return (
        <>
            <Navbar className="navTopBar" fixed="top" collapseOnSelect expand="lg" variant="dark">
                <Container>
                    <Navbar.Brand href="/">Tove</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/create-new-vote">Create new vote</Nav.Link>
                            <Nav.Link href="/profile">My votes</Nav.Link>
                            <Nav.Link href="/buy-me-a-coffee">Buy me a coffee</Nav.Link>
                        </Nav>
                        <Nav>
                            {
                                typeof(state) == 'object' && typeof (state.name) == 'string' ?
                                    <><NavDropdown title={state.name} id="collasible-nav-dropdown">
                                        <NavDropdown.Item href={"/profile/"}>Your profile</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item href="/logout">Log out</NavDropdown.Item>
                                    </NavDropdown></> :
                                    <><Nav.Link href="/sign-in">Sign in</Nav.Link></>
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

export default Header;