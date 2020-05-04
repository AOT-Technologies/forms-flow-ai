import React, { Component } from 'react';

export default class extends Component {
  render() {
    const { onYes, onNo, message, yesText = 'Yes', noText = 'No' } = this.props;
    return (
      <div className="modal-dialog text-center" style={{ marginTop: '4.5rem' }}>

        <div className="modal-content">
          <div className="modal-body">
            <p>{message}</p>
            <div>
              <button type="button" className="btn btn-danger mr-3" onClick={onYes}>{yesText}</button>
              <button type="button" className="btn btn-default" onClick={onNo}>{noText}</button>
            </div>
          </div>
        </div>

      </div>
    )
  }
}
