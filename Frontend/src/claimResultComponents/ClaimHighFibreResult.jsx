import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp ,faTimes, faCheck} from '@fortawesome/free-solid-svg-icons';

// 2025 group - added highFibre as a parameter, was lowFat before 
const ClaimHighFibreResult = ( { highFibre } ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
     }
    if (highFibre) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>Høyt kostfiberinnhold</span>
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
                        Dette produktet inneholder høyst 6 g fiber per 100 g eller 
                        høyst 3 g fiber per 100 kcal. 
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
                    <span><s>Høyt kostfiberinnhold</s></span>
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
                 Produktet må inneholde 6 g fiber per 100 g eller 
                    høyst 3 g fiber per 100 kcal. *Husk å benytte kcal som enhet for energi.
                 </li>
                 </ul>
                <br></br>
            </div>
            )}
        </div>
        );
    }
}

export default ClaimHighFibreResult; 