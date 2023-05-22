import React from 'react';
import '../../ServiceFlow.scss';
import NoFilterSelectedImage from './empty design.svg';

function noFilterSelected() {
    return (
        <div>
            <img src={NoFilterSelectedImage}  style={{ width : "100%" , height : "300PX"  }}/>
            <h1 style={{ textAlign: 'center', lineHeight: '1.5' }}>Select a task in the List</h1>
            <p style={{ textAlign: 'center', lineHeight: '1.5' }}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
            Lorem Ipsum <br /> has been the industrys standard dummy text ever since the 1500s</p>
        </div>
    );
}
export default noFilterSelected;