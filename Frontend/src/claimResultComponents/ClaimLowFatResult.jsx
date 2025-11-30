import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp ,faTimes, faCheck} from '@fortawesome/free-solid-svg-icons';

const ClaimLowFatResult = ( { lowFat } ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
     }
    if (lowFat) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>Lite fett</span>
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
                    Dette produktet inneholder høyst 3 g fett per 100 g
                    for næringsmidler i fast form, eller høyst 1,5 g fett 
                    per 100 ml for næringsmidler i flytende form.
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
                    <span><s>Lite fett</s></span>
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
                 For faste næringsmidler,må det være høyst 3 g fett per 100 g.
                 </li>
                 <li style={{ marginLeft: '-15px' }}>
                 <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em'  }} />
                 For flytende næringsmidler,må det være høyst 1,5 g fett per 100 ml.
                 </li>
                 </ul>
                <br></br>
            </div>
            )}
        </div>
        );
    }
}

export default ClaimLowFatResult; 