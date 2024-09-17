import { useState, useEffect } from 'react';
import { Container, Alert, Button, Badge, Row, Col, Spinner, Form, Modal, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API from '../API';
import dayjs from 'dayjs';
import '../css/style.css';
import deleteLogo from '../assets/trash-fill.svg';
import arrowLogo from '../assets/arrow-left-circle-fill.svg'
import wrenchLogo from '../assets/wrench.svg'

// function to handle the drag and drop
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

function My_Add_Page(props) {
  const [pageContent, setPageContent] = useState({
    title: '',
    user: props.user,
    blocks: [],
    creation_date: dayjs().format('YYYY-MM-DD'),
    publication_date: dayjs().format('YYYY-MM-DD'),
  });

  const [formBlocks, setFormBlocks] = useState([]);
  const [title, setTitle] = useState('');
  const [publication_date, setPublication_date] = useState(dayjs().format('YYYY-MM-DD'));
  const [error_message, setError_message] = useState('');
  const [save_message, setSave_message] = useState('');
  const [validated, setValidated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showImageModalUpdate, setShowImageModalUpdate] = useState(false);
  const [images, setImages] = useState([]);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [listAuthors, setListAuthors] = useState([]);
  const [author, setAuthor] = useState({});
  const [author_id, setAuthor_id] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (props.user != undefined && props.user.isAdmin === 1) {
      // fix for reload page
      setPageContent(
        (prevContent) => {
          return {
            ...prevContent,
            user: props.user,
          };},);
      API.getAllUsers().then((res) => {
        setListAuthors(res);
        if(author === undefined || author === null || Object.keys(author).length === 0) {
          setAuthor(props.user);
          setAuthor_id(props.user.id);
        }
      }).catch((err) => console.log(err));
    }
  }, [props.loggedIn]);

  // check if the user is logged in
  if (!props.loggedIn) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ height: '50vh' }}>
        <h1>
          You are not authorized to add a new page please login first
          <br/>
          <Button className='my-btn' onClick={() => navigate('/')}>Home Page</Button>
        </h1>
      </div>
    );
  }

  const handleModalGetAuthor = () => {
    setShowAuthorModal(true);
  };
  // when a page is deleted the user is redirected to the home page
  const doDeletePage = () => {
    setShowDeleteModal(false);
    navigate('/');
  };
  // generate a unique id for each block (just for client side)
  const generateUniqueId = () => {
    return Math.random().toString(36);
  };
  // a new block is added to the page
  const handleAddFormBlock = (type) => {
    const new_block = {
      id: generateUniqueId(),
      order_index: formBlocks.length,
      type: type,
      content: ''
    };
    setFormBlocks((prevBlocks) => [...prevBlocks, new_block]);
  };
  // update the content of a block
  const handleUpdateFormBlock = (index, content) => {
    const new_block = {
      ...formBlocks[index],
      content: content
    };
    setFormBlocks((prevBlocks) => [
      ...prevBlocks.slice(0, index),
      new_block,
      ...prevBlocks.slice(index + 1)
    ]);
  };
  // update the image of a block
  const handleUpdateFormBlockImage = (image, id) => {
    const updatedBlocks = formBlocks.map((block) => {
      if (block.id === id) {
        return {
          ...block,
          content: image.image_path
        };
      }
      return block;
    });
    setFormBlocks(updatedBlocks);
    setShowImageModalUpdate(false);
  };
  // remove a block from the page
  const handleRemoveFormBlock = (index) => () => {
    setFormBlocks((prevBlocks) => prevBlocks.filter((_, i) => i !== index));
    setFormBlocks((prevBlocks) => prevBlocks.map((block, i) => ({ ...block, order_index: i })));
  };
  // render the form blocks and and blocks when pressing the accurate button
  const renderFormBlocks = () => {
    return formBlocks.map((block, index) => (
      <Draggable key={block.id} draggableId={block.id.toString()} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Form.Group className={getBlockClassName(block.type)}>
              <div className="d-flex align-items-start">
                <div className="flex-grow-1">
                  <Form.Label >{block.type === 1 ? "Header" : block.type === 2 ? "Paragraph" : "Image"}</Form.Label>
                  {block.type === 1 && (
                    <Form.Control id={block.id} name="content" type="text" placeholder="Add new content here" onChange={(event) => handleUpdateFormBlock(index, event.target.value)} />
                  )}
                  {block.type === 2 && (
                    <Form.Control id={block.id} name="content" as="textarea" rows={3} placeholder="Add new content here" onChange={(event) => handleUpdateFormBlock(index, event.target.value)} />
                  )}
                  {block.type === 3 && (
                    <>
                      <Container className='image-show'>
                        <img src={"http://localhost:3000/" + block.content} className="image-thumbnail" onClick={() => setShowImageModalUpdate(true)} />
                      </Container>
                      <Modal show={showImageModalUpdate} onHide={() => setShowImageModalUpdate(false)} centered>
                        <Modal.Header >
                          <Modal.Title>Select Image</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <Carousel >
                            {images.map((image, index) => (
                              <Carousel.Item key={index} onClick={() => handleUpdateFormBlockImage(image, block.id)}>
                                <img src={"http://localhost:3000/" + image.image_path} className="image-thumbnail" />
                              </Carousel.Item>
                            ))}
                          </Carousel>
                        </Modal.Body>
                      </Modal>
                    </>
                  )}
                </div>
                <Button className="my-btn-add-delete" variant="secondary" onClick={handleRemoveFormBlock(index)}>
                  <img src={deleteLogo} alt="delete" className='my-svg' />
                </Button>
              </div>
            </Form.Group>
          </div>
        )}
      </Draggable>
    ));
  };
  // handle the drag and drop of the blocks
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updateBlocks = items.map((block, index) => ({
      ...block,
      order_index: index
    }));

    if (pageContent.blocks.length === updateBlocks.length) {
      setPageContent((prevPageContent) => ({
        ...prevPageContent,
        blocks: updateBlocks
      }));
    }
    setFormBlocks(updateBlocks);
  };
  // get the class name of the block
  const getBlockClassName = (type) => {
    switch (type) {
      case 1:
        return 'my-header-new';
      case 2:
        return 'my-paragraph-new';
      case 3:
        return 'my-image';
      default:
        return '';
    }
  }; 
  // handle the submit of the form
  const handleSubmitForm = async (event) => {
    event.preventDefault();
    setError_message('');
    const hasTitle = title.trim() !== '';
    const hasHeader = formBlocks.some((block) => block.type === 1 && block.content.trim() !== '');
    const hasParagraph = formBlocks.filter((block) => block.type === 2 && block.content.trim() !== '').length >= 1;
    const hasImage = formBlocks.filter((block) => block.type === 3 && block.content.trim() !== '').length >= 1;
    let valid = true;

    const updatedBlocks = formBlocks.filter((block) => block.content.trim() !== '');
    updatedBlocks.forEach((block, index) => {
      block.order_index = index;
    });

    const creation_date = dayjs().format('YYYY-MM-DD');
    const today = dayjs().format('YYYY-MM-DD');
    if (!hasTitle) {
      setError_message('Title is required');
      setTimeout(() => {
        setError_message('');
      }, 2000);
      valid = false;
      return;
    }
    else if (!hasHeader) {
      setError_message('At least 1 header not empty is required');
      setTimeout(() => {
        setError_message('');
      }, 2000);
      valid = false;
      return;
    }
    else if (!hasParagraph && !hasImage) {
      setError_message('At least 1 paragraph not empty or image selected is required');
      setTimeout(() => {
        setError_message('');
      }, 2000);
      valid = false;
      return;
    }
    else if (checked && (!dayjs(publication_date).isValid() || dayjs(publication_date).isBefore(today))) {
      setError_message('Publication date is not valid, please select a date in the future');
      setTimeout(() => {
        setError_message('');
      }, 2000);
      valid = false;
      return;
    }
    // if the form is valid, save the content
    if (valid) {
      setError_message('');
      setSave_message('Content saved successfully');

      setValidated(true);
      const newPageContent = {
        title: title,
        user: author,
        blocks: updatedBlocks,
        creation_date: creation_date,
        publication_date: checked ? publication_date : "Draft",
      };

      const json_id = await API.createPage(newPageContent);
      setTimeout(() => {
        setSave_message('');
        setValidated(false);
        navigate('/page/' + json_id.id, { replace: true });
      }, 1000);
    }
  }
  // function to handle the creation of a image block
  const handleSelectImage = (image) => {
    setShowImageModal(false);
    const new_block = {
      id: generateUniqueId(),
      order_index: formBlocks.length,
      type: 3,
      content: image.image_path
    };
    setFormBlocks((prevBlocks) => [...prevBlocks, new_block]);
    setShowImageModal(false);
  };

  const handleModalImage = async () => {
    const images = await API.getAllImages();
    setImages(images);
    setShowImageModal(true);
  };

  const handleAuthorChange = (event) => {
    event.preventDefault();
    const prevAuthor = pageContent.user.id;
    if (author !== prevAuthor) {
      const new_author = listAuthors.find((auth) => auth.id === parseInt(author_id));
      setPageContent((prevPageContent) => ({
        ...prevPageContent,
        user: new_author
      }));
      setAuthor(new_author);
    }
    setShowAuthorModal(false);
  };
  return (
    <>
      <Row style={{ marginRight: 0 }}>
        <Col>
          <div className="author-info">
            <div className="bg-light author-info-container p-2">
              <div style={{ padding: '10px' }}>
                <Container fluid className='p-2'>
                  <Badge className="my-badge">Autore</Badge> {(author === undefined || Object.keys(author).length === 0)? props.user.name : author.name}
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
                          <Form.Select onChange={(event) => setAuthor_id(event.target.value)} value={author_id}>
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
              </div>
            </div>
          </div>
        </Col>
        <Col xs={6}>
          <h1 className="mb-2 d-flex justify-content-center" id="title-page">Add New Page</h1>
          <Container fluid className="d-flex justify-content-center">
            <Button className="my-btn " variant="secondary" style={{ minWidth: "25%" }} onClick={() => handleAddFormBlock(1)}>
              Add Header
            </Button>
            <Button className="my-btn" variant="secondary" style={{ minWidth: "25%" }} onClick={() => handleAddFormBlock(2)}>
              Add paragraph
            </Button>
            <Button className="my-btn" variant="secondary" style={{ minWidth: "25%" }} onClick={() => handleModalImage()}>
              Add Image
            </Button>
            <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Select Image</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Carousel >
                  {images.map((image, index) => (
                    <Carousel.Item key={index} onClick={() => handleSelectImage(image)}>
                      <img src={"http://localhost:3000/" + image.image_path} className="image-thumbnail" />
                    </Carousel.Item>
                  ))}
                </Carousel>
              </Modal.Body>
            </Modal>
          </Container>
          <Form noValidate validated={validated} onSubmit={handleSubmitForm}>
            <Form.Group className='my-title-new'>
              <Form.Label>Title</Form.Label>
              <Form.Control id="title" name="title" type="text" placeholder="Title" onChange={(event) => setTitle(event.target.value)} required />
            </Form.Group>
            <Form.Group as={Row} className="justify-content-center align-items-center">
              <Col sm={6}>
                <Form.Label className="text-right">
                  Pubblication Date
                </Form.Label>
                <Form.Control id="pubdate" name="pubdate" placeholder={publication_date} type="date" disabled={!checked} onChange={(event) => setPublication_date(event.target.value)} required />
              </Col>
              <Col sm={6}>
                <Form.Label>Publish</Form.Label>
                <Form.Check id="checkdate" name="checkdate" type="checkbox" onChange={() => setChecked(!checked)} />
              </Col>
            </Form.Group>
            <DragDropContext onDragEnd={handleDragEnd}>
              <StrictModeDroppable droppableId="formBlocks">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {renderFormBlocks()}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </DragDropContext>
            <br />
            {error_message !== "" && (
              <Alert variant="danger">
                {error_message}
              </Alert>
            )}
            {save_message !== "" && (
              <Alert variant="success">
                {save_message}
              </Alert>
            )}
            <Container fluid className="d-flex justify-content-center p-4">
              <Button className="my-btn" type="submit" variant="secondary" style={{ width: "50%" }}>
                Save
              </Button>
            </Container>
          </Form>
        </Col>
        <Col>
          <Container fluid className="mt-3 d-flex justify-content-center">
            <Button className='my-btn' onClick={() => navigate('/')}>
              <img src={arrowLogo} className="my-svg" alt="Home" />
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
    </>
  );
}

export default My_Add_Page;
