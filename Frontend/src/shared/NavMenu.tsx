import React from "react";
import { useAuth } from "../context/AuthContext"; // Bruk den eksisterende contexten
import { Nav, Navbar, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import logo from "../img/logo.jpg";
import "../css/NavMenu.css";
import API_URL from "../apiConfig";

const NavMenu: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, name, profilePicture, handleLogout } = useAuth();

  const logout = async () => {
    await handleLogout();
    navigate("/account/login");
  };

  return (
    <Navbar bg="light" expand="lg" className="navbar-custom mb3">
      <Container className="d-flex justify-content-between align-items-center">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src={logo}
            className="img-logo img-fluid"
            alt="Fremtidsmat logo"
            style={{ height: "50px" }}
          />{" "}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link-custom">
              Hjem
            </Nav.Link>
            {isLoggedIn && (
              <Nav.Link as={Link} to="/products" className="nav-link-custom">
                Produkter
              </Nav.Link>
            )}
            {/*<Nav.Link as={Link} to="/calculator">Calculator</Nav.Link>*/}
          </Nav>
          <Nav className="ms-auto">
            {isLoggedIn ? (
              <>
                <Nav.Link
                  as={Link}
                  to="/account/profile"
                  className="d-flex align-items-center"
                >
                  <img
                    src={
                      profilePicture
                        ? `${API_URL}${profilePicture}`
                        : `${API_URL}/images/profile_pictures/male-placeholder-image.png`
                    }
                    alt="Profile picture"
                    className="rounded-circle object-fit-cover"
                    style={{
                      width: "30px",
                      height: "30px",
                      marginRight: "10px",
                    }}
                  />

                  {name}
                </Nav.Link>
                <Nav.Link as="button" onClick={logout}>
                  Logout
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/account/login">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavMenu;
