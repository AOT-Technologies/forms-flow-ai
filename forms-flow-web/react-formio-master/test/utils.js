import ReactDOM from 'react-dom';
import {mount as enzymeMount} from './enzyme';

const WAIT = 1000;

export function autoreject(msg, fn) {
  if (typeof msg === 'function') {
    fn = msg;
    msg = `Timeout of ${WAIT}ms exceeded.`;
  }

  return new Promise((resolve, reject) => {
    setTimeout(
      () => reject(new Error(msg)),
      WAIT
    );
    fn(resolve);
  });
}

// Generate an enhanced mount function.
export function createMount(options1 = {}) {
  const {mount = enzymeMount, ...other1} = options1;

  const attachTo = window.document.createElement('div');
  attachTo.className = 'app';
  attachTo.setAttribute('id', 'app');
  window.document.body.insertBefore(attachTo, window.document.body.firstChild);

  const mountWithContext = function mountWithContext(node, options2 = {}) {
    return mount(node, {
      attachTo,
      ...other1,
      ...options2,
    });
  };

  mountWithContext.attachTo = attachTo;
  let n = 1;
  mountWithContext.cleanUp = () => {
    if (n === 0) { debugger } else {
      n -= 1;
    }
    ReactDOM.unmountComponentAtNode(attachTo);
    attachTo.parentNode.removeChild(attachTo);
  };

  return mountWithContext;
}

export function createIfExceed() {
  let sub = null;
  const ifexceed = (msg, fn) => {
    return autoreject(msg, resolve => {
      sub = () => {
        if (fn.length > 0) {
          fn(resolve);
        }
        else {
          fn();
          resolve();
        }
      };
    });
  };
  const notify = () => {
    if (typeof sub === 'function') {
      sub();
      sub = null;
    }
  };

  return {ifexceed, notify};
}

export function seq(fns) {
  const [init, ...tail] = fns;

  return tail.reduce((promise, fn) => promise.then(fn), init());
}

export default {
  autoreject,
  createMount,
  createIfExceed,
  seq,
};
