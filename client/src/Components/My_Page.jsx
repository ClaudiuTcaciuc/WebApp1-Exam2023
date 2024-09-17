import { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../API';
import dayjs from 'dayjs';
import '../css/style.css';
import deleteLogo from '../assets/trash-fill.svg';
import editLogo from '../assets/gear-wide-connected.svg';
import arrowLogo from '../assets/arrow-left-circle-fill.svg'


function My_Page(props) {
  const [pageContent, setPageContent] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    API.getPageContent(id)
      .then(data => setPageContent(data)
      )
      .catch(err => (navigate('/')));
  }, [props.loggedIn]);

  const doDeletePage = async () => {
    setShowDeleteModal(false);
    await API.deletePage(id);
    navigate('/');
  };
  // wait for the page to be loaded
  if (pageContent.length === 0 || props.user === undefined) return (
    <div className='d-flex justify-content-center'>
      <Spinner animation="border" role="status"> </Spinner>
      {' '}Loading
    </div>
  );
  // if the page is not published and the user is not logged in, redirect to the home page
  if((props.user===null || props.user === undefined) &&  !dayjs(pageContent.page_info.publication_date).isBefore(dayjs())){
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ height: '50vh' }}>
        <h1>
          You are not authorized to see this page
          <br/>
          <Button className='my-btn' onClick={() => navigate('/')}>Home Page</Button>
        </h1>
      </div>
    );
  }
  // if the user is an admin or the author of the page, he can edit it so show the edit button
  const editable = (props.loggedIn && (props.user.isAdmin === 1 || props.user.id === pageContent.page_info.author_id));
  
  function content_type_view(block) {
    return (
      <Card key={block.block_id} className="my-card-container">
        <Card.Body>
          {block.block_type === 1 ? (
            <Card.Title>{block.content}</Card.Title>
          ) : block.block_type === 2 ? (
            <Card.Text>{block.content}</Card.Text>
          ) : (
            <Container fluid className="d-flex justify-content-center">
              <Card.Img src={"http://localhost:3000/" + block.content} className='image-show ' />
            </Container>
          )}
        </Card.Body>
      </Card>
    )
  }
  return (
    <Container fluid>
      <Row>
        <Col >
          <div className="author-info">
            <div className="bg-light author-info-container p-1">
              <div style={{ padding: '10px' }}>
                <Container fluid>
                  <Badge className='my-badge'>Autore</Badge> {pageContent.page_info.author}
                  <br />
                  <Badge className='my-badge'>Release Date</Badge> {
                    dayjs(pageContent.page_info.publication_date).isValid() ?
                    dayjs(pageContent.page_info.publication_date).isAfter(dayjs()) ? "Scheduled" : "Released" : ""
                  } {" "} {pageContent.page_info.publication_date}
                  <br />
                  <Badge className='my-badge'>Creation Date</Badge> {pageContent.page_info.creation_date}
                </Container>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={6}>
          <div className="my-page-title">
            <h1>{pageContent.page_info.title}</h1>
          </div>
          <div className='my-page-content'>
            {pageContent.content.map((block) => content_type_view(block))}
          </div>
        </Col>
        <Col>
          <Container fluid className='mt-3 d-flex justify-content-center'>
            <Button className='my-btn' variant="primary" onClick={() => navigate("/")}>
              <img src={arrowLogo} className='my-svg' />
            </Button>
          </Container>
          <Container fluid className='mt-3 d-flex justify-content-center'>
            {editable ?
              <Button className='my-btn' variant="primary" onClick={() => navigate(`/edit_page/${id}`)}>
                <img src={editLogo} className='my-svg' />
              </Button>
              : null}
          </Container>
          <Container fluid className='mt-3 d-flex justify-content-center'>
            {editable ?
              <Button variant="danger" onClick={() => setShowDeleteModal(!showDeleteModal)}>
                <img src={deleteLogo} className='my-svg' />
              </Button>
              : null}
          </Container>
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(!showDeleteModal)}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this page?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(!showDeleteModal)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => doDeletePage()}>
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default My_Page