import React from "react";

const CompactFormView = () => {
  React.useEffect(() => {
    // Create or update style element for single-spa overrides
    let styleElement = document.getElementById("single-spa-style-overrides");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "single-spa-style-overrides";
      document.head.appendChild(styleElement);
    }
    
    // Add your custom CSS overrides here
    styleElement.textContent = `
      .formio-form, .form-builder {
        transform: scale(0.95);
        transform-origin: top;
        zoom: 0.9 !important;
      }
      
      .formio-form .form-group, .formio-builder-form .form-group {
        margin-bottom: 0 !important;
      }
      
      .formio-component {
        padding-top: .25rem !important;
      }
      
      .formio-form, .formio-wizard-nav-container.list-inline {
        padding-top: 0.25rem !important;
      }
      
      .col-form-label {
        padding-bottom: 0 !important;
      }
    `;
    
    return () => {
      // Cleanup on unmount
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);
  
  return null;
};

export default CompactFormView;