import { OverlayTrigger, Popover } from "react-bootstrap";

interface InfoPopoverProps {
  text: string;
}

const InfoPopover: React.FC<InfoPopoverProps> = ({ text }) => {
  return (
    <OverlayTrigger
      trigger={["hover", "focus"]}
      placement="top"
      overlay={
        <Popover id="popover-info">
          <Popover.Body>{text}</Popover.Body>
        </Popover>
      }
    >
      <i className="bi bi-info-circle-fill ms-2" style={{ cursor: "help" }}></i>
    </OverlayTrigger>
  );
};
export default InfoPopover;
