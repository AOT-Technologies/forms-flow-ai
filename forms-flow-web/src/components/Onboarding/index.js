import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { ApplicationLogo, V8CustomButton, SelectDropdown, OnboardingImage1, OnboardingImage2, OnboardingImage3, OnboardingImage4 } from "@formsflow/components";
import { INDUSTRY_OPTIONS, ROLE_OPTIONS, ORGANIZATION_SIZE_OPTIONS } from "./onboardingConstants";
import "./onboarding.scss";

const onboardingSteps = [
  {
    title: "Quickly create powerful forms in seconds.",
    description: [
      "Simply drag and drop fields using our intuitive form builder",
      "Import existing forms in one step and begin editing immediately",
      "Effortlessly map custom fields and create custom form links"
    ],
    image: <OnboardingImage1 />
  },
  {
    title: "Build any workflow using our simple visual tools",
    description: [
      "Create simple workflows that auto-generate clear, actionable tasks",
      "Easily generate approval processes from any form submission",
      "Manage workflows visually or enable powerful DMN or BPMN features"
    ],
    image: <OnboardingImage2 />
  },
  {
    title: "Efficiently turn form  submissions into actions",
    description: [
      "Turn form submissions into assignable tasks for your team",
      "Reassign, collaborate or escalate form submissions in one click",
      "Guarantee the right people see the right form submissions every time"
    ],
    image: <OnboardingImage3 />
  },
  {
    title: "Unlock the power of simple forms in your organization",
    description: [
      "Tell us a little about yourself and your organization so we can make formsflow work better for you",
    ],
    image: <OnboardingImage4 />
  },
  {
    title: "How do you want to use formsflow?",
    description: [
      "Choosing a focus will help us make sure you experience the parts of formsflow that are most relevant to your goals"
    ],
    additionalInfo: [
      "Choosing a focus does not limit your access in any way"
    ]
  }
];

export default React.memo(() => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [organizationSize, setOrganizationSize] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    setShowModal(true);
  }, []);

  const handleNext = () => {
    if (currentStep === 4) {
      setButtonLoading(true);
      
      const selectedData = {
        industry,
        role,
        organizationSize,
        selectedRole
      };
      console.log("Selected onboarding data:", selectedData);
      
      setTimeout(() => {
        setShowModal(false);
        setButtonLoading(false);
      }, 1000);
    } else if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowModal(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderVisualization = () => {
    return (
      <div className="welcome-visualization">
        {currentStepData.image}
      </div>
    );
  };

  const currentStepData = onboardingSteps[currentStep];

  const isNextButtonDisabled = 
    (currentStep === 3 && (!industry || !role || !organizationSize)) ||
    (currentStep === 4 && !selectedRole);

  return (
    <div className="" id="main">
      <Modal
        show={showModal}
        size="xl"
        dialogClassName="onboarding-modal"
        data-testid="onboarding-modal"
        aria-labelledby="onboarding-modal-title"
        aria-describedby="onboarding-modal"
        backdrop="static"
        centered>
        <Modal.Header className="onboarding-header">
          <Modal.Title className="d-flex align-items-center">
            <ApplicationLogo data-testid="application-logo" />
            <p className="m-0 ms-2">{t("formsflow")}</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="onboarding-body">
            <div className="onboarding-content">
              {currentStep >= 3 ? (
                <>
                  <div className="onboarding-left-panel">
                    <h2 className="onboarding-title">{t(currentStepData.title)}</h2>
                    <div className="onboarding-description">
                      {currentStepData.description.map((desc, index) => (
                        <p key={index}>{t(desc)}</p>
                      ))}
                    </div>
                    {currentStepData.image && (
                      <div className="onboarding-image-container">
                        {currentStepData.image}
                      </div>
                    )}
                    {currentStepData.additionalInfo && (
                      <div className="onboarding-additional-info">
                        {currentStepData.additionalInfo.map((info, index) => (
                          <p key={index}>{t(info)}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="onboarding-right-panel">
                    {currentStep === 3 ? (
                      <div className="onboarding-dropdowns">
                        <div className="onboarding-dropdown-item">
                          <label className="onboarding-dropdown-label">{t("Industry")}</label>
                          <SelectDropdown
                            options={INDUSTRY_OPTIONS}
                            value={industry}
                            onChange={setIndustry}
                            searchDropdown={false}
                            placeholder={t("Select")}
                            ariaLabel="Industry"
                            dataTestId="onboarding-industry-dropdown"
                          />
                        </div>
                        <div className="onboarding-dropdown-item">
                          <label className="onboarding-dropdown-label">{t("Role")}</label>
                          <SelectDropdown
                            options={ROLE_OPTIONS}
                            value={role}
                            onChange={setRole}
                            searchDropdown={false}
                            placeholder={t("Select")}
                            ariaLabel="Role"
                            dataTestId="onboarding-role-dropdown"
                          />
                        </div>
                        <div className="onboarding-dropdown-item">
                          <label className="onboarding-dropdown-label">{t("Organization size")}</label>
                          <SelectDropdown
                            options={ORGANIZATION_SIZE_OPTIONS}
                            value={organizationSize}
                            onChange={setOrganizationSize}
                            searchDropdown={false}
                            placeholder={t("Select")}
                            ariaLabel="Organization size"
                            dataTestId="onboarding-org-size-dropdown"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="onboarding-right-content">
                        <div className="onboarding-focus-cards">
                          <div
                            className={`onboarding-focus-card ${selectedRole === "creator" ? "selected" : ""}`}
                            onClick={() => setSelectedRole("creator")}
                            data-testid="focus-creator-card"
                          >
                            <div className="onboarding-focus-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="15.5" stroke="#E5E5E5"/>
                              </svg>
                            </div>
                            <div className="onboarding-focus-content">
                              <h3 className="onboarding-focus-title">{t("I'm a creator")}</h3>
                              <p className="onboarding-focus-description">{t("I build forms and workflows for my organization")}</p>
                            </div>
                          </div>
                          <div
                            className={`onboarding-focus-card ${selectedRole === "manager" ? "selected" : ""}`}
                            onClick={() => setSelectedRole("manager")}
                            data-testid="focus-manager-card"
                          >
                            <div className="onboarding-focus-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <circle cx="16" cy="16" r="15.5" stroke="#E5E5E5"/>
                                </svg>
                            </div>
                            <div className="onboarding-focus-content">
                              <h3 className="onboarding-focus-title">{t("I'm a manager")}</h3>
                              <p className="onboarding-focus-description">{t("I make sure the right people act on form submissions")}</p>
                            </div>
                          </div>
                          <div
                            className={`onboarding-focus-card ${selectedRole === "notSure" ? "selected" : ""}`}
                            onClick={() => setSelectedRole("notSure")}
                            data-testid="focus-not-sure-card"
                          >
                            <div className="onboarding-focus-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="15.5" stroke="#E5E5E5"/>
                              </svg>
                            </div>
                            <div className="onboarding-focus-content">
                              <h3 className="onboarding-focus-title">{t("I'm not sure")}</h3>
                              <p className="onboarding-focus-description">{t("I want to explore and browse at my own pace")}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="onboarding-left-panel">
                    {renderVisualization(currentStep)}
                  </div>
                  <div className="onboarding-right-panel">
                    <h2 className="onboarding-title">{t(currentStepData.title)}</h2>
                    <div className="onboarding-description">
                      {currentStepData.description.map((desc, index) => (
                        <p key={index}>{t(desc)}</p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between align-items-center w-100">
            {currentStep > 0 && (
              <V8CustomButton
                label={t("Back")}
                onClick={handleBack}
                dataTestId="onboarding-back-button"
                variant="secondary"
                disabled={buttonLoading}
              />
            )}
            {currentStep === 0 && <div></div>}
            <div className="step-indicator">
              {currentStep + 1} of {onboardingSteps.length}
            </div>
            <V8CustomButton
              variant="primary"
              label={currentStep === onboardingSteps.length - 1 ? t("Get Started") : t("Next")}
              onClick={handleNext}
              dataTestId="onboarding-next-button"
              disabled={isNextButtonDisabled}
              iconWithText={currentStep === 4}
              loading={buttonLoading}
            />
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
});
