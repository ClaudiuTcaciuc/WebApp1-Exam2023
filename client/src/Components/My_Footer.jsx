// import react / bootstrap libraries
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// import logo
import plusLogo from '../assets/plus-circle-fill.svg';
// import css
import '../css/style.css';
import houseLogo from '../assets/house-door-fill.svg';
function My_Footer(props) {
  const navigate = useNavigate();
  return (
    <Container fluid>
      <div className='fixed-bottom-right'>
        {props.loggedIn && (
          <div className='button-wrapper'>
            <Link to='/add_page' className='my-link'>
              <Button variant='primary' size='lg'>
                <img src={plusLogo} className='App-logo my-svg' alt='logo' />
              </Button>
            </Link>
          </div>
        )}
        <div className='button-wrapper'>
          <Button className='me-2' size='lg' onClick={() => navigate('/')}>
            <img src={houseLogo} className='App-logo my-svg' alt='logo' />{" "}
          </Button>
        </div>
      </div>
    </Container>
  );
}
export default My_Footer;