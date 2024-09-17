import { useState, useEffect } from 'react';
import { Container, Button, Modal, Badge, Row, Col, Spinner, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API from '../API';
import '../css/style.css';
import deleteLogo from '../assets/trash-fill.svg';
import wrenchLogo from '../assets/wrench.svg';
import saveLogo from '../assets/check-circle-fill.svg';
import dayjs from 'dayjs';
import ContentTypeView from './ContentTypeView';

const StrictModeDroppable = ({ children, droppableId }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }
  return <Droppable droppableId={droppableId}>{children}</Droppable>;
};

function My_Edit_Page(props) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pageContent, setPageContent] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [titlePage, setTitlePage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [dirty, setDirty] = useState(false);
  const [showEmptyBlockAlert, setShowEmptyBlockAlert] = useState(false);
  const [errorBlock, setErrorBlock] = useState("");

  const [images, setImages] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [pubDate, setPubDate] = useState("");
  const [pubDateError, setPubDateError] = useState("");
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [checked, setChecked] = useState(false);

  const [listAuthors, setListAuthors] = useState([]);
  const [author, setAuthor] = useState("");

  useEffect(() => {
    API.getPageContent(id)
      .then((data) => {
        setPageContent(data)
        setTitlePage(data.page_info.title);
        setAuthor(data.page_info.author_id);
      })
      .catch((err) => navigate('/'));
  }, [dirty, props.LoggedIn]);

  useEffect(() => {
    if (images.length === 0) {
      API.getAllImages()
        .then((data) => {
          setImages(data);
        }).catch((err) => console.log(err));
    }
    if (props.user != undefined && props.user.isAdmin === 1) {
      API.getAllUsers().then((res) => {
        setListAuthors(res);
      }).catch((err) => console.log(err));
    }
  }, [showAuthorModal]);

  const doDeletePage = async () => {
    setShowDeleteModal(false);
    await API.deletePage(id);
    navigate('/');
  };

  const handleSaveClick = () => {
    for (let block of pageContent.content) {
      if (block.content.trim() === "") {
        setShowEmptyBlockAlert(true);
        return;
      }
    }
    setShowEmptyBlockAlert(false);
    navigate("/page/" + id);
  }

  const handleTitleChange = (event) => {
    event.preventDefault();
    if (titlePage.trim() === "") {
      setErrorTitle("Title can not be empty");
      return;
    }
    setErrorTitle("");
    setShowModal(false);
    doTitleUpdate(titlePage);
  };

  const doTitleUpdate = async (new_title) => {
    await API.updatePageTitle(new_title, id);
    setDirty(!dirty);
  };

  if (pageContent.length === 0 || pageContent.content === undefined) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ height: '50vh' }}>
        <Spinner animation="border" role="status" /> Loading
      </div>
    );
  }

  if (props.user === null || (props.user.isAdmin === 0 && props.user.id !== pageContent.page_info.author_id)) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ height: '50vh' }}>
        <h1>
          You are not authorized to edit this page
          <br/>
          <Button className='my-btn align-items-center' onClick={() => navigate('/')}>Home Page</Button>
        </h1>
      </div>
    );
  }

  function handleOnDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    const items = Array.from(pageContent.content);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    items.forEach((item, index) => { item.order_index = index + 1; });
    setPageContent({ ...pageContent, content: items });
    doUpdateOrder();
  }

  const doUpdateOrder = async () => {
    await API.updateContentBlockOrder(pageContent);
  };

  const handleDateChange = (event) => {
    event.preventDefault();
    if (!checked) {
      const today = dayjs().format("YYYY-MM-DD");
      if (!dayjs(pubDate).isValid() || (dayjs(pubDate).isBefore(today))) {
        setPubDateError("The date must be a valid date today or in the future");
        return;
      }
    }
    setPubDateError("");
    const selectedDate = checked ? "Draft" : pubDate;
    doDateUpdate(selectedDate);
  };

  const doDateUpdate = async (new_date) => {
    await API.updateDatePage(new_date, id);
    setShowDateModal(false);
    setDirty(!dirty);
    setChecked(false);
  };

  const handleModalOnHide = () => {
    setShowDateModal(false);
    setPubDateError("");
  };

  const handleModalGetAuthor = () => {
    setShowAuthorModal(true);
  };

  const handleAuthorChange = (event) => {
    event.preventDefault();
    const author_id = author.split(" ")[0];
    API.changePageUser(author_id, id);
    setShowAuthorModal(false);
    setDirty(!dirty);
  };

  const handleModalCloseTitle = () => {
    setShowModal(false);
    setErrorTitle("");
    setTitlePage(pageContent.page_info.title);
  };

  return (
    <Container fluid>
      <Row style={{ marginRight: 0 }}>
        <Col>
          <div className="author-info">
            <div className="bg-light author-info-container p-1">
              <div style={{ padding: '10px' }}>
                <Container fluid>
                  <Badge className="my-badge">Autore</Badge> {pageContent.page_info.author} {" "}
                  {props.user.isAdmin ?
                    <Button className='my-btn-mod' size='sm' onClick={() => handleModalGetAuthor()}>
                      <img src={wrenchLogo} alt="logo" />{" "}
                    </Button> : null}
                  <Modal show={showAuthorModal} onHide={() => setShowAuthorModal(false)} centered>
                    <Modal.Header closeButton>
                      <Modal.Title>Change the Author of the Page</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form onSubmit={handleAuthorChange} name="change-author">
                        <Form.Group controlId="authorSelect">
                          <Form.Label>Select an Author</Form.Label>
                          <Form.Select onChange={(event) => setAuthor(event.target.value)} value={author}>
                            {listAuthors.map((user, index) => (
                              <option key={index} value={user.id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                        <br />
                        <Container fluid className="d-flex justify-content-center">
                          <Button variant="primary" type="submit">
                            Submit
                          </Button>
                        </Container>
                      </Form>
                    </Modal.Body>
                  </Modal>
                </Container>
                <Container fluid >
                  <Badge className="my-badge">Release </Badge> {
                    dayjs(pageContent.page_info.publication_date).isValid() ?
                      dayjs(pageContent.page_info.publication_date).isAfter(dayjs()) ? "Scheduled" : "Released" : ""
                  }{" "}
                  {pageContent.page_info.publication_date}
                  <Button className='my-btn-mod' size='sm' onClick={() => setShowDateModal(!showDateModal)}>
                    <img src={wrenchLogo} alt="logo" />{" "}
                  </Button>
                  <br />
                  <Badge className="my-badge">Creation </Badge> {pageContent.page_info.creation_date}
                  <Modal show={showDateModal} onHide={() => handleModalOnHide()} centered>
                    <Modal.Header closeButton>
                      <Modal.Title>Change the Date of the Page</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form onSubmit={handleDateChange}>
                        {pubDateError !== "" ? <Alert variant="danger">{pubDateError}</Alert> : null}
                        <Form.Group>
                          <Row>
                            <Col sm={6}>
                              <Form.Label>Page Date</Form.Label>
                              <Form.Control type="date" title="date" name="date" disabled={checked} onChange={(e) => setPubDate(e.target.value)} />
                            </Col>
                            <Col sm={6}>
                              <Form.Label>Set To Draft</Form.Label>
                              <Form.Check id="checkdate" name="checkdate" type="checkbox" onChange={() => setChecked(!checked)} />
                            </Col>
                          </Row>
                        </Form.Group>
                        <Container fluid className="d-flex justify-content-center p-4">
                          <Button variant="primary" type="submit">
                            Submit
                          </Button>
                        </Container>
                      </Form>
                    </Modal.Body>
                  </Modal>
                </Container>
              </div>
            </div>
          </div>
        </Col>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Col xs={6} >
            <div className="my-page-title">
              <h1>
                {pageContent.page_info.title}
                <Button variant='secondary' className="my-edit-title" onClick={() => setShowModal(true)}>
                  <img src={wrenchLogo} alt="logo" />{" "}
                </Button>
                <Modal show={showModal} onHide={() => handleModalCloseTitle()}>
                  <Modal.Header closeButton>
                    <Modal.Title>Change the Title of the Page</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form onSubmit={handleTitleChange}>
                      <Form.Group>
                        <Form.Label>Page Title</Form.Label>
                        <Form.Control
                          name="title"
                          type="text"
                          title="title"
                          value={titlePage}
                          placeholder="Enter the new title of the page"
                          onChange={(event) => setTitlePage(event.target.value)}
                        />
                      </Form.Group>
                      <p className="text-danger">{errorTitle}</p>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={() => handleModalCloseTitle()}>
                          Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                          Submit
                        </Button>
                      </Modal.Footer>
                    </Form>
                  </Modal.Body>
                </Modal>
              </h1>
            </div>
            {showEmptyBlockAlert && (
              <Alert variant="danger">A page can not be save with empty blocks</Alert>
            )}
            {errorBlock !== "" && (
              <Alert variant="danger">{errorBlock}</Alert>
            )}
            <div className='d-flex'>
              <StrictModeDroppable droppableId="content">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ minWidth: "100%" }}>
                    {pageContent.content.map((block, index) => (
                      <Draggable key={block.block_id} draggableId={block.block_id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='p-2' >
                            <ContentTypeView
                              block={block}
                              isDragging={snapshot.isDragging}
                              pageContent={pageContent}
                              page_id={id}
                              setDirty={setDirty}
                              dirty={dirty}
                              images={images}
                              setImage={setImages}
                              setErrorBlock={setErrorBlock}
                              setShowEmptyBlockAlert={setShowEmptyBlockAlert}
                            />
                          </div>)}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </div>
          </Col>
        </DragDropContext>
        <Col>
          <Container fluid className="mt-3 d-flex justify-content-center">
            <Button id="save" variant="success" onClick={() => handleSaveClick()}>
              <img src={saveLogo} className="my-svg" alt="Save" />
            </Button>
          </Container>
          <Container fluid className="mt-3 d-flex justify-content-center">
            <Button id="delete" variant="danger" onClick={() => setShowDeleteModal(!showDeleteModal)}>
              <img src={deleteLogo} className="my-svg" alt="Delete" />
            </Button>
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
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default My_Edit_Page;
