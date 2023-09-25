
import baseEditForm from 'formiojs/components/_classes/component/Component.form';

const settingsForm = (...extend) => {
  return baseEditForm([
    {
      key: 'display',
      components: [],   
    },
    {
      key: 'data',
      components: [],
    },
    {
      key: 'validation',
      components: [],
    },
    {
      key: 'api',
      components: [],
    },
    {
      key: 'conditional',
      components: [],
    },
    {
      key: 'logic',
      components: [],
    },
  ], ...extend);
};

export default settingsForm;
