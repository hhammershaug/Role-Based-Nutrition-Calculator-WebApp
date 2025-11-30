import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp ,faTimes, faCheck} from '@fortawesome/free-solid-svg-icons';

const ClaimReducedFatResult = ( { reducedFat } ) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpanded = () => { setIsExpanded(!isExpanded); }
    
    if (reducedFat) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>Redusert innhold av fett</span>
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
                    Innhold av fett er minst 30 % lavere enn i et lignende produkt.
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
                    <span><s>Redusert innhold av fett</s></span>
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
                 Innhold av fett er minst 30 % lavere enn i et lignende produkt.
                 </li>
                 
                 </ul>
                <br></br>
            </div>
            )}
        </div>
        );
    }
}

export default ClaimReducedFatResult; 