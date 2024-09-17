import { useState } from 'react';
import { Container, Card, Button, Carousel } from 'react-bootstrap';
import API from '../API';
import '../css/style.css';
import deleteLogo from '../assets/trash-fill.svg';
import dndLogo from '../assets/arrow-down-up.svg';

function ContentTypeView(props) {
  const [editable_block, setEditableBlock] = useState(null);
  // set the props name, so its easier to read
  const block = props.block;
  const isDragging = props.isDragging;
  const pageContent = props.pageContent;
  const setDirty = props.setDirty;
  const dirty = props.dirty;
  const images = props.images;
  const id = props.page_id;
  const setErrorBlock = props.setErrorBlock;
  const setShowEmptyBlockAlert = props.setShowEmptyBlockAlert;

  // set the style of the block when its being dragged or edited
  const dnd_style = isDragging ? "my-card-container-edit-dnd"
    : editable_block === null || editable_block === undefined ? "my-card-container-edit" : "my-card-container-edit-empty";
  const edit = editable_block === block.block_id;

  const handleDoubleClick = () => {
    setEditableBlock(block.block_id);
  };
  // the blur event is triggered when the user clicks outside the block and the content is updated
  const handleBlur = (event) => {
    event.preventDefault();
    // fix for content changing on the button text or title
    if (event.target.nodeName === "BUTTON")
      return;
    
    const new_content = event.target.innerText.trim();
    // a block cannot be empty
    if (new_content === "") {
      event.target.innerText = block.content;
      setDirty(!dirty);
      setEditableBlock(null);
      setErrorBlock("A block cannot be empty");
      setTimeout(() => {
        setErrorBlock("");
      }, 5000);
      return;
    }
    const block_id = block.block_id;
    doUpdateBlock({ block_id, content: new_content });
    setEditableBlock(null)
  };

  function renderEditableContent(block, edit, isDragging) {
    const BlockElement = block.block_type === 1 ? Card.Title : Card.Text;
    let content;
    // if the content is null or empty, display a message (should not happen cause I change the logic of a new block)
    if (block.block_type === 1 || block.block_type === 2) {
      content = block.content !== null && block.content !== '' ? block.content : "Double Click To Modify";
    } else {
      if (block.block_type === 3) { // logic for the image block (its separated cause it dosent use a editable block element)
        if (block.content === null || block.content === "default.jpg") {
          content = (
            <Carousel slide={false} >
              {images.map((image, index) => (
                <Carousel.Item key={index} onClick={() => handleUpdateFormBlockImage(image, block.block_id)}>
                  <img src={"http://localhost:3000/" + image.image_path} className='image-show' />
                </Carousel.Item>
              ))}
            </Carousel>
          );
        } else {
          content = (
            <div onClick={() => handleUpdateFormBlockImage("", block.block_id)}>
              <Card.Img src={"http://localhost:3000/" + block.content} className='image-show ' />
              <div className="image-overlay"></div>
            </div>
          );
        }
      }
    }
    return (
      <>
        {block.block_type === 1 || block.block_type === 2 ? (
          <BlockElement
            contentEditable={edit}
            onClick={handleDoubleClick}
            onBlur={handleBlur}
            className={edit ? 'content-editable' : ''}
            style={{ whiteSpace: 'pre-wrap' }}
            suppressContentEditableWarning
            onMouseDownCapture={(e) => e.stopPropagation()}
          >
            {content}
          </BlockElement>
        ) : (
          <Container fluid className="d-flex justify-content-center ">{content}</Container>
        )}
        {!isDragging && editable_block === null ? (
          <>
            <Button variant="secondary" size="sm" className="hover-button-title" onClick={() => handleAdd(block.order_index, 1)}>Title</Button>
            <Button variant="secondary" size="sm" className="hover-button-text" onClick={() => handleAdd(block.order_index, 2)}>Text</Button>
            <Button variant="secondary" size="sm" className="hover-button-img" onClick={() => handleAdd(block.order_index, 3)}>Img</Button>
            <Button className="hover-button-del" onClick={() => handleErrorDelete(block)}>
              <img src={deleteLogo} className="my-svg" alt="Delete" />
            </Button>
          </>
        ) : null}
      </>
    );
  }
  // function that hadndles all errors when deleting a block 
  const handleErrorDelete = (block) => {
    const numHeader = pageContent.content.filter((block) => block.block_type === 1 && block.content.trim() !== "").length;
    const numParagraph = pageContent.content.filter((block) => block.block_type === 2 && block.content.trim() !== "").length;
    const numImage = pageContent.content.filter((block) => block.block_type === 3).length;
    if (block.block_type == 1 && numHeader - 1 <= 0 ) {
      setErrorBlock("You must have at least one header not empty");
      setTimeout(() => {
        setErrorBlock("");
      }, 5000);
      return;
    }
    if ((block.block_type == 2 || block.block_type == 3) && numParagraph + numImage - 1 <= 0) {
      setErrorBlock("You must have at least one paragraph not empty or image selected");
      setTimeout(() => {
        setErrorBlock("");
      }, 5000);
      return;
    }
    handleDelete(block.block_id);
  };

  const handleUpdateFormBlockImage = (image, block_id) => {
    const new_path = image === "" ? "default.jpg" : image.image_path;
    new_path === "default.jpg" || "" ? setEditableBlock(block_id) : setEditableBlock(null);
    doImageUpdate(new_path, block_id);
  }

  const doImageUpdate = async (image, block_id) => {
    await API.updateBlockImage(image, block_id);
    setDirty(!dirty);
  };

  const doUpdateBlock = async (block) => {
    await API.editContentBlock(block, id);
    setDirty(!dirty);
    setShowEmptyBlockAlert("");
  };

  const handleDelete = (blockId) => {
    doDeleteBlock(blockId);
  };

  const doDeleteBlock = async (block_id) => {
    await API.deleteContentBlock(block_id);
    setDirty(!dirty);
  };

  const handleAdd = (order_index, type) => {
    order_index = order_index - 1;
    const last_id = Math.max.apply(Math, pageContent.content.map(function (o) { return o.block_id; }))
    // create a new block with a fake id because the db will replace it
    const new_block = {
      block_id: last_id + 1,
      block_type: type,
      content: type === 3 ? "default.jpg" : "Double Click To Modify",
      order_index: pageContent.content[order_index].order_index + 1,
      page_id: pageContent.content[order_index].page_id,
    };

    doAddBlock(new_block);
  };

  const doAddBlock = async (block) => {
    await API.addContentBlock(block, id);
    setDirty(!dirty);
  };

  return (
    <Card key={block.block_id} className={dnd_style} onMouseDown={(e) => e.preventDefault()}>
      <Card.Body>
        {isDragging ? <img className="my-svg-dnd" src={dndLogo} alt="dnd" /> : null}
        {renderEditableContent(block, edit, isDragging)}
      </Card.Body>
    </Card>
  );
}

export default ContentTypeView;