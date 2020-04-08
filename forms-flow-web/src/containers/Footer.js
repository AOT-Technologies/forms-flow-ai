import React, {Component} from 'react';

export default class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <div className="container text-center" style={{padding: '15px'}}>
          Built with ♥ by&nbsp;
          <a href="https://form.io">Form.io</a>
        </div>
      </footer>
    );
  }
}
