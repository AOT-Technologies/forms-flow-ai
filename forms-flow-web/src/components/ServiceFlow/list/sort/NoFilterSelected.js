import React from 'react';
import '../../ServiceFlow.scss';
import NoFilterSelectedImage from './empty design.svg';

function noFilterSelected() {
    return (
        <div>
            <img src={NoFilterSelectedImage}  style={{ width : "100%" , height : "300PX"  }}/>
            <h1 style={{ textAlign: 'center', lineHeight: '1.5' }}>Select a task in the List</h1>
            <p style={{ textAlign: 'center', lineHeight: '1.5' }}>Select a specific task from the provided list of options. Your selection will determine the task you will be working on or interacting with.</p>
        </div>
    );
}
export default noFilterSelected;