
//import baseEditForm from 'formiojs/components/_classes/component/Component.form';
import buttonEditForm from 'formiojs/components/button/Button.form';
const settingsForm = (...extend) => {
  return buttonEditForm([
    {
      key: 'display',
      components: [
        {
          // Or add your own. The syntax is form.io component definitions.
          type: "input",
          storeas: "array",
          input: true,
          label: "Action Type",
          weight: 20,
          key: "actionType", // This will be available as component.topic
          tooltip: "Enter the actionType here",
        },
      ],   
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
