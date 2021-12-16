module.exports = function(app, template, hook) {
  const docker = process.env.DOCKER;
  const assert = require('assert');
  const Helper = require('../../helper')(app);
  let helper = null;
  const test = require('../../fixtures/forms/datetime-format.js');
  const testFile = require('../../fixtures/forms/fileComponent.js');

  function getComponentValue(exportedText, compKey, submissionIndex) {
    const rows = exportedText.split('\n');
    const headerRow = rows[0];
    const headings = headerRow.split(/,(?=")/);
    const compColIndex = headings.indexOf(`"${compKey}"`);
    const submissionRow = rows[submissionIndex + 1];
    const submissionRowValues = submissionRow.split(/,(?=")/);;
    const compValue = submissionRowValues[compColIndex];
    console.log({
      rows,
      headerRow,
      headings,
      compColIndex,
      submissionRow,
      submissionRowValues,
      compValue
    });
    return compValue;
  }

  describe('CSVExporter', () => {
    it('Sets up a default project', (done) => {
      let owner = (app.hasProjects || docker) ? template.formio.owner : template.users.admin;
      helper = new Helper(owner);
      helper.project().user('user', 'user1').execute(done);
    });

    it(`Export works in case when format is not set`, (done) => {
      let owner = (app.hasProjects || docker) ? template.formio.owner : template.users.admin;
      helper = new Helper(owner);
      helper
        .project()
        .form('test', test.components)
        .submission({ data: { dateTime: '2020-03-10T09:00:00.000Z' } })
        .execute((err) => {
          if (err) {
            return done(err);
          }
          helper.getExport(helper.template.forms.test, 'csv', (error, result) => {
            if (error) {
              done(error);
            }
            assert(!!result.text.split('\n')[1].split(',')[3], 'Date was not set');
            done();
          });
        });
    });

    it(`Test displaying File values`, (done) => {
      let owner = (app.hasProjects || docker) ? template.formio.owner : template.users.admin;
      helper = new Helper(owner);
      helper
        .project()
        .form('testFile', testFile.components)
        .submission({
          data: {
            file: [
              {
                name: 'myFilePrefix-sunil-naik-0eNs9-dO9jM-unsplash-91e11557-3e57-465f-acf7-2e6ae867f45b.jpg',
                originalName: 'sunil-naik-0eNs9-dO9jM-unsplash.jpg',
                size: 2752197,
                storage: 'base64',
                type: 'image/jpeg',
                url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD',
              },
              {
                name: 'myFilePrefix-szabolcs-toth-t6A2qw9gjAo-unsplash-e88df4aa-0de1-4f40-982c-12cf88974c51.jpg',
                originalName: 'szabolcs-toth-t6A2qw9gjAo-unsplash.jpg',
                size: 1296003,
                storage: 'base64',
                type: 'image/jpeg',
                url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAA',
              }
            ]
          }
        })
        .execute((err) => {
          if (err) {
            return done(err);
          }
          helper.getExport(helper.template.forms.testFile, 'csv', (error, result) => {
            if (error) {
              done(error);
            }

            const fileValue = getComponentValue(result.text, 'file', 0);
            const expectedValue =
              '"myFilePrefix-sunil-naik-0eNs9-dO9jM-unsplash-91e11557-3e57-465f-acf7-2e6ae867f45b.jpg, ' +
              'myFilePrefix-szabolcs-toth-t6A2qw9gjAo-unsplash-e88df4aa-0de1-4f40-982c-12cf88974c51.jpg"';
            assert.strictEqual(fileValue, expectedValue);
            done();
          });
        });
    });
  });
};
