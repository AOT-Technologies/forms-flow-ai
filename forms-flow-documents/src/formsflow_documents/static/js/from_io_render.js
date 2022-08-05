function renderForm() {
  
  // loading custom components from formsflow-formio-custom-elements (npm package)
  try {
    const components = FormioCustom.components
    for (var key of Object.keys(components)) {
      Formio.registerComponent(key, components[key]);
    }
  }
  catch (err) {
    console.log("Cannot load custom components.")
  }
  
  Formio.setBaseUrl(form_info.base_url);
  Formio.setProjectUrl(form_info.project_url);
  Formio.setToken(form_info.token)
  Formio.createForm(
    document.getElementById('formio'),
    form_info.form_url,
    { readOnly: true, renderMode: 'flat' }
  ).then((form) => {
    form.ready.then(() => {
      document.getElementById('formio').classList.add("completed")
    });
  });
}

