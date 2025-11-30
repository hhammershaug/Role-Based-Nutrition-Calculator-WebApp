import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'; // Import the faTimes icon

const ClaimFatFreeResult = ({ fatFree }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    }

    if (fatFree) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>Fettfri</span>
                    <div
                        style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}}
                        onClick={toggleExpanded}
                    >
                        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                    </div>
                </div>
                {isExpanded && (
                    <div style={{ width: '100%' }}>
                        <p style={{ paddingLeft: '20px' }}> 
                        <FontAwesomeIcon icon={faCheck} style={{ color: 'green', marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em' }} />
                        Dette produktet inneholder høyst 0,5 g fett per 100 g eller 100 ml.
                        </p>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>
                        {/* Use the FontAwesomeIcon for "times" to represent "x" */}
                        <s>Fettfri</s>
                    </span>

                    <div
                        style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}}
                        onClick={toggleExpanded}
                    >
                        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                    </div>
                </div>
                {isExpanded && (
                    <div style={{ width: '100%' }}>
                        <ul>
                         <li style={{ marginLeft: '-15px' }}>
                         <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px' , fontWeight: 'bold', fontSize: '1.2em' }} />
                         Fettinnholdet må være høyst 0,5 g per 100g eller 100 ml.
                        </li>
                        </ul>
                        <br></br>
                    </div>
                )}
            </div>
        );
    }
}

export default ClaimFatFreeResult;

