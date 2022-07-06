function renderForm() {
    Formio.setBaseUrl(form_info.base_url);
    Formio.setProjectUrl(form_info.project_url);
    Formio.setToken(form_info.token)
    Formio.createForm(
        document.getElementById('formio'),
        form_info.form_url,
        {readOnly : true}
      ).then((form) => {
        document.getElementById('formio').classList.add("completed")

      });
  }
  
  document.addEventListener("DOMContentLoaded", function(){
    renderForm();
  });