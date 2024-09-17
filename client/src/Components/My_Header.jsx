import { Button, Container, Form, Navbar, Modal, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import globeLogo from '../assets/globe-americas.svg';
import personLogo from '../assets/person-circle.svg';
import wrenchLogo from '../assets/wrench.svg';
import '../css/style.css';
import API from '../API';

function My_Header(props) {
  const navigate = useNavigate();
  // state for the modals
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangeNameModal, setshowChangeNameModal] = useState(false);
  // state for the app name
  const [appname, setAppname] = useState(props.app_name);
  const [messageError, setMessageError] = useState('');
  // state for the user name
  const name = props.loggedIn === true ? props.user.name : 'Login';
  // function to handle the logout
  const doLogOut = async () => {
    setShowLogoutModal(false);
    await API.logOut();
    props.setUser(null);
    props.setLoggedIn(false);
    navigate('/');
  }
  // function to handle the change of the app name
  const handleNameChange = (event) => {
    event.preventDefault();
    setMessageError('');
    const name = event.target.name.value;
    if (name.trim() === '') {
      setMessageError('Name cannot be empty');
      return;
    }
    props.setApp_name(name);
    doChangeName(name);
  }
  // function to change the app name
  const doChangeName = async (name) => {
    setshowChangeNameModal(false);
    await API.changeAppName(name);
  }

  const handleNameChangeCancel = () => {
    setshowChangeNameModal(false);
    setMessageError('');
    setAppname(props.app_name);
  }

  return (
    <Navbar className='my-header' variant="dark" expand="sm">
      <Container fluid>
        <Navbar.Brand>
          <Button className=" me-2" onClick={() => navigate('/')}>
            <img src={globeLogo} className="App-logo my-svg" alt="logo" />{" "}
            {props.app_name}
          </Button>
          {(props.loggedIn && props.user.isAdmin === 1) ? (
            <Button className=" me-2" onClick={() => setshowChangeNameModal(!showChangeNameModal)}>
              <img src={wrenchLogo} className="App-logo my-svg" alt="logo" />{" "}
            </Button>
          ) : null}
        </Navbar.Brand>
        {(props.loggedIn) ? (
          <Nav className="me-auto" activeKey={'allpages'}>
            <Link to="" className="nav-link">All </Link>
            <Link to="publicpages" className="nav-link">Public </Link>
            <Link to="progpages" className="nav-link">Programmed </Link>
            <Link to="draftpages" className="nav-link">Draft </Link>
          </Nav>
        ) : null}
        {props.loggedIn ? (
          <Navbar.Brand>
            <Button className="me-5 text-white" onClick={() => setShowLogoutModal(!showLogoutModal)}>
              <img src={personLogo} className="User-logo-logo my-svg" alt="logo" />{" "}
              {name + ' ( Logout )'}
              {props.user.isAdmin === 1 ? " Admin" : ""}
            </Button>
          </Navbar.Brand>
        ) : (
          <Navbar.Brand>
            <Button className=" me-5 text-white" onClick={() => navigate('/login')} >
              <img src={personLogo} className="User-logo-logo my-svg" alt="logo" />{" "}
              {name}
            </Button>
          </Navbar.Brand>
        )}
      </Container>
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(!showLogoutModal)}>
        <Modal.Header closeButton>
          <Modal.Title>Logout Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(!showLogoutModal)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => doLogOut()}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showChangeNameModal} onHide={() => handleNameChangeCancel()}>
        <Modal.Header closeButton>
          <Modal.Title>Change the Application name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleNameChange}>
            <Form.Group>
              <Form.Label>Application Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                defaultValue={props.app_name}
                onChange={(event) => setAppname(event.target.value)}
              />
            </Form.Group>
            <p className="text-danger">{messageError}</p>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => handleNameChangeCancel()}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </Navbar>
  );
}

export default My_Header;
