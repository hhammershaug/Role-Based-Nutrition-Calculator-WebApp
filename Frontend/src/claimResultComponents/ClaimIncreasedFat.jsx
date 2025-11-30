import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp ,faTimes, faCheck} from '@fortawesome/free-solid-svg-icons';

const ClaimIncreasedFatResult = ( { claimIncreasedFat } ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
     }
    if (claimIncreasedFat) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>Høyt innhold av enumettet fett</span>
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
                    Dette produktet inneholder en høy fettprosent
                </p>
            </div>
        )}
    </div>
        );
    } 
    else {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span><s>Høyt innhold enumettet fett</s></span>
                    <div
                        style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}}
                        onClick={toggleExpanded}
                    >
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                    </div>
                </div>
                {isExpanded && (
                    <div style={{ width: '100%'}}>
                
                <ul>
                 <li  style={{ marginLeft: '-15px' }}>
                 <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px' , fontWeight: 'bold', fontSize: '1.2em' }} />
                 Produktet sin fettprosent gjør slik at produktet ikke oppfyler kravet til påstanden.
                 </li>
                 </ul>
                <br></br>
            </div>
            )}
        </div>
        );
    }
}

export default ClaimIncreasedFatResult; 