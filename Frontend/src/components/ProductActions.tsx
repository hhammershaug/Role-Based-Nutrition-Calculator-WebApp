import React, { useState } from "react";
import {
  Button,
  ButtonGroup,
  Modal,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProductActionsProps {
  productId: number;
  onDelete: (id: number) => Promise<boolean>;
  sm?: boolean;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  productId,
  onDelete,
  sm = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleDeleteClick = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const { role } = useAuth();
  const isResearcher = role === "Researcher";

  const handleConfirmDelete = async () => {
    const success = await onDelete(productId);
    if (success) {
      navigate("/products");
    }
    setShowModal(false);
  };

  return (
    <>
      <OverlayTrigger
        trigger={["hover", "focus"]}
        placement="top"
        overlay={
          isResearcher ? (
            <Popover id="popover-nokkelhullet">
              <Popover.Body>
                Du har ikke tilgang til å redigere eller slette produkter.
              </Popover.Body>
            </Popover>
          ) : (
            <></>
          )
        }
      >
        <div style={{ display: "inline-block" }}>
          <ButtonGroup style={isResearcher ? { cursor: "help" } : {}}>
            <Button
              href={`/products/calculatorUpdate/${productId}`}
              variant="outline-primary"
              aria-label="Rediger produkt"
              size={sm ? "sm" : undefined}
              disabled={isResearcher}
            >
              <i className="bi bi-pencil-square" aria-hidden="true"></i>
            </Button>
            <Button
              onClick={handleDeleteClick}
              variant="outline-danger"
              aria-label="Slett produkt"
              size={sm ? "sm" : undefined}
              disabled={isResearcher}
            >
              <i className="bi bi-trash" aria-hidden="true"></i>
            </Button>
          </ButtonGroup>
        </div>
      </OverlayTrigger>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bekreft sletting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Er du sikker på at du vil slette dette produktet? Denne handlingen kan
          ikke angres.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Avbryt
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Slett
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductActions;
