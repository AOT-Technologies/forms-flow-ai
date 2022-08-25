const form_options = { readOnly: true, renderMode: "flat" };
// Function to get submission data if formadapter is enabled
async function fetchSubmission() {
  const submission = await fetch(form_info.submission_url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: form_info.auth_token,
    },
  });
  const result = await submission.json();
  return result;
}

// Help web driver to idetify the form rendered completely.
function formReady() {
  document.getElementById("formio").classList.add("completed");
}

// Render form with form adapter 
function renderFormWithSubmission() {
  Formio.createForm(
    document.getElementById("formio"),
    form_info.form_url,
    form_options
  ).then((form) => {
    fetchSubmission().then((submission) => {
      form.submission = submission;
      form.ready.then(() => {
        formReady();
      });
    });
  });
}

// Render form from formio
function renderFormWithOutSubmission() {
  Formio.createForm(
    document.getElementById("formio"),
    form_info.form_url,
    form_options
  ).then((form) => {
    form.ready.then(() => {
      formReady();
    });
  });
}

function renderForm() {
  // loading custom components from formsflow-formio-custom-elements (npm package)
  try {
    const components = FormioCustom.components;
    for (var key of Object.keys(components)) {
      Formio.registerComponent(key, components[key]);
    }
  } catch (err) {
    console.log("Cannot load custom components.");
  }

  try {
    Formio.setBaseUrl(form_info.base_url);
    Formio.setProjectUrl(form_info.project_url);
    Formio.setToken(form_info.token);

    if (form_info.form_apater) {
      renderFormWithSubmission();
    } else {
      renderFormWithOutSubmission();
    }
  } catch (err) {
    console.log("Cannot render form", err);
    document.getElementById("formio").innerHTML('Cannot render form')
    formReady();
  }


}
