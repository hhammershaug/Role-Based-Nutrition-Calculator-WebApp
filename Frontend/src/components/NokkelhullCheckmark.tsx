import { OverlayTrigger, Popover } from "react-bootstrap";

const NokkelhullCheckmark: React.FC = () => {
  return (
    <>
      <OverlayTrigger
        trigger={["hover", "focus"]}
        placement="top"
        overlay={
          <Popover id="popover-nokkelhullet">
            <Popover.Body>Støtter Nøkkelhullet</Popover.Body>
          </Popover>
        }
      >
        <i
          className="bi bi-check-circle-fill text-success h4"
          style={{ cursor: "help" }}
        ></i>
      </OverlayTrigger>
    </>
  );
};

export default NokkelhullCheckmark;
