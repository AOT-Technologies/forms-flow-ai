import EventEmitter from 'eventemitter2';
import React from 'react';
import sinon from 'sinon';
import {expect} from 'chai';
import Form from '../src/components/Form';
import {
  textField,
  visible,
  layout,
  columns,
  formWithInput
} from './fixtures';

import {
  createIfExceed,
  createMount,
  seq
} from './utils';

describe('Form component', function() {
  let mount;
  let options;

  beforeEach(() => {
    options = {
      events: new EventEmitter({
        wildcard: false,
        maxListeners: 0
      })
    };
    mount = createMount();
  });

  afterEach(() => {
    options.events.removeAllListeners();
    mount.cleanUp();
  });

  it('should create formio instance.', function() {
    const element = mount(
      <Form
        form={{display: 'form', components: [textField]}}
        options={options}
      />);
    return element
      .instance()
      .createPromise
      .then(formio => {
        expect(formio).to.be.an('object');
        expect(formio.isBuilt).to.be.true;
      });
  });

  it('should trigger change on form change.', function() {
    const {ifexceed, notify} = createIfExceed();
    const onchange = sinon.spy(notify);
    let root;
    let input;
    let element;
    return seq([
      () => {
        element = mount(
          <Form
            form={{display: 'form', components: [textField]}}
            onChange={onchange}
            options={options}
          />
        );
        return ifexceed('initial change is not triggered', () => {
          expect(onchange.calledOnce).to.be.true;
          // throw new Error;
        });
      },
      () => {
        root = element.getDOMNode();
        input = root.querySelector('input[type="text"]');
        input.value = 'text';
        input.dispatchEvent(new Event('input'));
        return ifexceed('textField change is not triggered', () => {
          expect(onchange.calledTwice).to.be.true;
        });
      },
      () => {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        return ifexceed('textField change is not triggered', () => {
          expect(onchange.calledThrice).to.be.true;
        });
      }
    ]);
  });

  it('should trigger change when field is visible.', function() {
    const {ifexceed, notify} = createIfExceed();
    const onchange = sinon.spy(notify);
    let root;
    let input;
    let checkbox;
    let element;
    return seq([
      () => {
        element = mount(
          <Form
            form={{display: 'form', components: visible}}
            onChange={onchange}
          />
        );
        return ifexceed('not initialised', () => {
          expect(onchange.calledOnce).to.be.true;
        });
      },
      () => {
        root = element.getDOMNode();
        checkbox = root.querySelector('input[type="checkbox"]');
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed('not trigger on checkbox change', () => {
          expect(onchange.callCount).to.equal(2);
        });
      },
      () => {
        input = root.querySelector('input[type="text"]');
        input.value = 'text';
        input.dispatchEvent(new Event('input'));
        return ifexceed('input change fail', () => {
          expect(onchange.callCount).to.equal(3);
        });
      },
      () => {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        return ifexceed('input change fail', () => {
          expect(onchange.callCount).to.equal(4);
        });
      },
      () => {
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed('checkbox click fail', () => {
          expect(onchange.callCount).to.equal(5);
        });
      }
    ]);
  });

  it('should trigger change and remove hidden data on form load.', function() {
    const {ifexceed, notify} = createIfExceed();
    const onchange = sinon.spy(notify);
    let root;
    let input;
    let checkbox;
    let element;
    let formio;

    return seq([
      () => {
        element = mount(
          <Form
            form={{display: 'form', components: visible}}
            onChange={onchange}
            submission={{data: {visible: false, textfield: 'Test'}}}
          />
        );
        return ifexceed('fail on init change', () => {
          formio = element.instance().formio;
          root = element.getDOMNode();
          expect(onchange.calledOnce).to.be.true;
          expect(formio.submission).to.have.deep.property('data', {visible: false});
        });
      },
      () => {
        checkbox = root.querySelector('input[type="checkbox"]');
        input = root.querySelector('input[type="text"]');
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed('fail on checkbox click', () => {
          expect(onchange.calledTwice).to.be.true;
          expect(formio.submission).to.deep.equal({data: {visible: true, textfield: ''}});
        });
      },
      () => {
        input.value = 'value';
        input.dispatchEvent(new Event('input'));
        return ifexceed('fail on textfield input', () => {
          expect(onchange.callCount).to.equal(3);
          expect(formio.submission).to.deep.equal({data: {visible: true, textfield: 'value'}});
        });
      },
      () => {
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed('fail on checkbox hide', () => {
          expect(onchange.callCount).to.equal(4);
          expect(formio.submission).to.deep.equal({data: {visible: false}});
        });
      }
    ]);
  });

  it('should trigger change when data exists.', function() {
    const {ifexceed, notify} = createIfExceed();
    const onchange = sinon.spy(notify);
    let root;
    let input;
    let checkbox;
    let element;
    let formio;
    return seq([
      () => {
        element = mount(
          <Form
            form={{display: 'form', components: visible}}
            onChange={onchange}
            submission={{data: {visible: true, textfield: 'Test'}}}
          />
        );
        return ifexceed('fail on init change', () => {
          formio = element.instance().formio;
          root = element.getDOMNode();
          checkbox = root.querySelector('input[type="checkbox"]');
          input = root.querySelector('input[type="text"]');
          expect(onchange.calledOnce).to.be.true;
          expect(formio.submission).to.deep.equal({data: {visible: true, textfield: 'Test'}});
        });
      },
      () => {
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed('fail on checkbox click', () => {
          expect(onchange.calledTwice).to.be.true;
          expect(formio.submission).to.deep.equal({data: {visible: false}});
        });
      },
      () => {
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed('fail on checkbox click', () => {
          expect(onchange.callCount).to.equal(3);
          expect(formio.submission).to.deep.equal({data: {visible: true, textfield: ''}});
        });
      },
      () => {
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed('fail on checkbox click', () => {
          expect(onchange.callCount).to.equal(4);
          expect(formio.submission).to.deep.equal({data: {visible: false}});
        });
      }
    ]);
  });

  it('should trigger change when data is hidden in a layout component.', function() {
    const groupname = 'Layout Test';
    const {ifexceed, notify} = createIfExceed();
    const onchange = sinon.spy(notify);
    let root;
    let input;
    let checkbox;
    let element;
    let formio;
    return seq([
      function() {
        const testname = `${groupname} 1 Initial change`;
        element = mount(
          <Form
            form={{display: 'form', components: layout}}
            onChange={onchange}
            submission={{data: {visible: false, textfield: 'Test'}}}
          />
        );
        return ifexceed(`${testname}: initial change timeout`, () => {
          formio = element.instance().formio;
          root = element.getDOMNode();
          checkbox = root.querySelector('input[type="checkbox"]');
          input = root.querySelector('input[type="text"]');
          expect(
            onchange.calledOnce,
            `${testname}: onChange not triggerd on initial change`
          ).to.be.true;
          expect(
            formio.submission,
            `${testname}: submission.data should not contain keys other then "visible"`
          ).to.deep.equal({data: {visible: false}});
        });
      },
      function() {
        const testname = `${groupname} 2 Show input`;
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed(`${testname}: checkbox change timeout`, () => {
          expect(
            onchange.calledTwice,
            `${testname}: onChange not triggerd on checkbox change`
          ).to.be.true;
          expect(
            formio.submission,
            `${testname}: submission.data should include textfield with empty value`
          ).to.deep.equal({data: {visible: true, textfield: ''}});
        });
      },
      function() {
        const testname = `${groupname} 3 Hide input`;
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed(`${testname}: checkbox change timeout`, () => {
          expect(
            onchange.callCount,
            `${testname}: onChange not triggerd on checkbox change`
          ).to.equal(3);
          expect(
            formio.submission,
            `${testname}: submission.data should not contain keys other then "visible"`
          ).to.deep.equal({data: {visible: false}});
        });
      },
      function() {
        const testname = `${groupname} 4 Show input`;
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed(`${testname}: checkbox change timeout`, () => {
          expect(
            onchange.callCount,
            `${testname}: onChange not triggerd on checkbox change`
          ).to.equal(4);
        });
      },
      function() {
        const testname = `${groupname} 5 Set input value`;
        input.value = 'value';
        input.dispatchEvent(new Event('input'));
        return ifexceed(`${testname}: input change timeout`, () => {
          expect(
            onchange.callCount,
            `${testname}: onChange not triggerd on input change`
          ).to.equal(5);
          expect(
            formio.submission,
            `${testname}: submission.data should include textfield with value "value"`
          ).to.deep.equal({data: {visible: true, textfield: 'value'}});
        });
      },
      function() {
        const testname = `${groupname} 6 Hide input, clear submission data`;
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed(`${testname}: input change timeout`, () => {
          expect(
            onchange.callCount,
            `${testname}: onChange not triggerd on input change`
          ).to.equal(6);
          expect(
            formio.submission,
            `${testname}: submission.data should not contain keys other then "visible"`
          ).to.deep.equal({data: {visible: false}});
        });
      },
    ]);
  });

  it('should trigger change when dat is hindden in a columns component.', function() {
    const groupname = 'Columns Test';
    const {ifexceed, notify} = createIfExceed();
    const onchange = sinon.spy(notify);
    let root;
    let input;
    let checkbox;
    let element;
    let formio;
    return seq([
      function() {
        const testname = `${groupname} 1 Init`;
        element = mount(
          <Form
            form={{display: 'form', components: columns}}
            onChange={onchange}
            submission={{data: {visible: false, textfield: 'Test'}}}
          />
        );
        return ifexceed(`${testname}: initial change timeout`, () => {
          formio = element.instance().formio;
          root = element.getDOMNode();
          checkbox = root.querySelector('input[type="checkbox"]');
          input = root.querySelector('input[type="text"]');
          expect(
            onchange.calledOnce,
            `${testname}: onChange not triggerd on initial change`
          ).to.be.true;
          expect(
            formio.submission,
            `${testname}: submission.data should not contain keys other then "visible"`
          ).to.deep.equal({data: {visible: false}});
        });
      },
      function() {
        const testname = `${groupname} 2 Show columns`;
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed(`${testname}: checkbox change timeout`, () => {
          expect(
            onchange.calledTwice,
            `${testname}: onChange not triggerd on checkbox change`
          ).to.be.true;
          expect(
            formio.submission,
            `${testname}: submission.data should include textfield with empty value`
          ).to.deep.equal({data: {visible: true, textfield: ''}});
        });
      },
      function() {
        const testname = `${groupname} 3 Hide columns`;
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed(`${testname}: checkbox change timeout`, () => {
          expect(
            onchange.callCount,
            `${testname}: onChange not triggerd on checkbox change`
          ).to.equal(3);
          expect(
            formio.submission,
            `${testname}: submission.data should not contain keys other then "visible"`
          ).to.deep.equal({data: {visible: false}});
        });
      },
      function() {
        const testname = `${groupname} 4 Hide columns`;
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed(`${testname}: checkbox change timeout`, () => {
          expect(
            onchange.callCount,
            `${testname}: onChange not triggerd on checkbox change`
          ).to.equal(4);
        });
      },
      function() {
        const testname = `${groupname} 5 Hide columns`;
        input.value = 'value';
        input.dispatchEvent(new Event('input'));
        return ifexceed(`${testname}: input change timeout`, () => {
          expect(
            onchange.callCount,
            `${testname}: onChange not triggerd on checkbox change`
          ).to.equal(5);
          expect(
            formio.submission,
            `${testname}: submission.data should include textfield with value "value"`
          ).to.deep.equal({data: {visible: true, textfield: 'value'}});
        });
      },
      function() {
        const testname = `${groupname} 6 Hide columns`;
        checkbox.dispatchEvent(new MouseEvent('click'));
        return ifexceed(`${testname}: input change timeout`, () => {
          expect(
            onchange.callCount,
            `${testname}: onChange not triggerd on input change`
          ).to.equal(6);
          expect(
            formio.submission,
            `${testname}: submission.data should not contain keys other then "visible"`
          ).to.deep.equal({data: {visible: false}});
        });
      },
    ]);
  });

  it('should have own event emitter', function() {
    const {ifexceed: timeout1, notify: notify1} = createIfExceed();
    const {ifexceed: timeout2, notify: notify2} = createIfExceed();
    const onchange1 = sinon.spy(notify1);
    const onchange2 = sinon.spy(notify2);
    let element;
    let input1;
    let input2;

    return seq([
      () => {
        element = mount(
            <div>
              <Form form={formWithInput} onChange={onchange1} />
              <Form form={formWithInput} onChange={onchange2} />
            </div>
        );

        return Promise.all([
          timeout1('Form1 fail on init change', () => {
            expect(onchange1.calledOnce, 'Form1 init change triggerd more then once').to.be.true;
          }),
          timeout2('Form2 fail on init change', () => {
            expect(onchange2.calledOnce, 'Form2 init change triggerd more then once').to.be.true;
          })
        ]);
      },
      () => {
        // Trigger input 1 change.
        input1 = element.getDOMNode().getElementsByTagName('input')[0];
        input1.value = 1;
        input1.dispatchEvent(new Event('input'));

        return timeout1('input1 change is not triggered', () => {
          expect(
            onchange1.calledTwice,
            'Form1#onChange triggerd more then twice after input1 change').to.be.true;
        });
      },
      () => {
        expect(onchange2.calledOnce, 'input1 triggerd Form2#onChange').to.be.true;

        input2 = element.getDOMNode().getElementsByTagName('input')[1];
        input2.value = 2;
        input2.dispatchEvent(new Event('input'));

        return timeout2('input2 change is not triggerd', () => {
          expect(
            onchange2.calledTwice,
            'Form2#onChange triggered more then twice after input2 change'
          ).to.be.true;
        });
      },
      () => {
        expect(
          onchange1.calledTwice,
          'input2 triggered Form1#onChange'
        ).to.be.true;
      }
    ]);
  });
});
