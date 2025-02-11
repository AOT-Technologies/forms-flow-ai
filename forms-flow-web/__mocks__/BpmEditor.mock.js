const React = require('react');

const mockModeler = {
  saveXML: jest.fn().mockResolvedValue({
    xml: '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definition_1">\n<bpmn:process id="Process_1" isExecutable="false"></bpmn:process>\n</bpmn:definitions>'
  }),
  on: jest.fn(),
  off: jest.fn(),
  destroy: jest.fn()
};

const BpmEditorMock = {
  __esModule: true,
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      getXML: jest.fn().mockResolvedValue("<xml>test-xml</xml>"),
      setXML: jest.fn().mockResolvedValue(undefined),
      modeler: mockModeler
    }));

    return (
      <div 
        data-testid="bpmn-editor"
        onClick={() => props.onChange && props.onChange("<new-bpmn-xml>")}
      >
        Mocked BPMN Editor
      </div>
    );
  })
};

// Export the mock and the mockModeler for direct access in tests
export { BpmEditorMock as default, mockModeler };