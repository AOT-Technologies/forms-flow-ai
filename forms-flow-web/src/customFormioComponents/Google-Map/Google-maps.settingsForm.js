import baseEditForm from 'formiojs/components/_classes/component/Component.form';

const settingsForm = (...extend) => {
  return baseEditForm([
    {
      key: 'display',
      components: [
        {
          // You can ignore existing fields.
          key: 'placeholder',
          ignore: true,
        },
      ]
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

