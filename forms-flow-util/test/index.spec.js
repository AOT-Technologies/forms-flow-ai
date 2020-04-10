import chai from 'chai';
import FormioExport from '../lib/aot-formio-export';

import form from './samples/form.json';
import submission from './samples/submission.json';

chai.expect();

const expect = chai.expect;

let lib;

describe('Given an instance of FormioExport class', () => {
  before(() => {
    lib = new FormioExport(form, submission);
  });
  describe('when I need the constructor name', () => {
    it('should return the name', () => {
      expect(lib.constructor.name).to.be.equal('FormioExport');
    });
  });

  describe('when I need the formio component', () => {
    it('should return the component', () => {
      expect(lib.component.type).to.be.equal(form.type);
    });
  });

  describe('when I need the formio component\'s data', () => {
    it('should return the component\' data', () => {
      expect(lib.data).to.be.equal(submission.data);
    });
  });

  describe('when I need the formio component\'s nested components', () => {
    it('should return the nested components array', () => {
      expect(lib.component.components.constructor).to.be.equal(Array);
    });
  });

  describe('Given a nested component of the formio component', () => {
    let component;

    before(() => {
      component = lib.component.components[0];
    });

    describe('when I need the nested component\'s key', () => {
      it('should return the nested component\' key', () => {
        expect(component.key).to.be.equal(form.components[0].key);
      });
    });

    describe('when I need the nested component\'s value ', () => {
      it('should return the nested component\' value', () => {
        expect(component._value).to.be.equal(submission.data[component.key]);
      });
    });
  });
});
