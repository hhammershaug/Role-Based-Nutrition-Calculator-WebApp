import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

/**
 *
 * @returns An information icon with popover of a list of password requirements.
 */
const PasswordSpecs: React.FC = ({}) => {
  return (
    <span>
      <OverlayTrigger
        trigger={["hover", "focus"]}
        placement="top"
        overlay={
          <Popover id="popover-nokkelhullet">
            <Popover.Body>
              <ul>
                <li>Minst 8 tegn</li>
                <li>Minst 6 unike tegn</li>
                <li>Minst 1 stor bokstav</li>
                <li>Minst 1 liten bokstav</li>
                <li>Minst 1 tall</li>
                <li>Minst 1 spesialtegn</li>
              </ul>
            </Popover.Body>
          </Popover>
        }
      >
        <i className="bi bi-info-circle-fill" style={{ cursor: "help" }}></i>
      </OverlayTrigger>
    </span>
  );
};

export default PasswordSpecs;
