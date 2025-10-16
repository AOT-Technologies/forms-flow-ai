import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { PromptModal } from "@formsflow/components";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const NavigateBlocker = React.memo(({ isBlock, message, secondaryMessage }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [nextLocation, setNextLocation] = useState({ onOk: false });

  useEffect(() => {
    if (isBlock) {
      const unblock = history.block((location) => {
        const currentPathname = history.location.pathname;
        if (location?.pathname == currentPathname) return true;
        if (!nextLocation.onOk) {
          setNextLocation((prev) => ({
            ...prev,
            ...location,
            currentPath: history.location.pathname,
          })); // Save the location user is trying to navigate to
          setShowPrompt(true); // Show the custom modal
          return false; // Block navigation for now
        }
        return true; // Allow navigation if shouldBlock is false
      });

      return () => {
        unblock();
      };
    }
  }, [isBlock, history, nextLocation.onOk, nextLocation.currentPath]);

  // Trigger navigation when nextLocation.onOk becomes true
  useEffect(() => {
    if (nextLocation.onOk) {
      history.push(nextLocation.pathname); // Allow navigation
    }
  }, [nextLocation.onOk, history, nextLocation.pathname]);

  const handleToggleShow = () => setShowPrompt(!showPrompt);
  const resetPath = () =>
    window.history.replaceState({}, "", nextLocation.currentPath);

  const handleConfirm = (confirm) => {
    handleToggleShow();
    setNextLocation((prev) => ({ ...prev, onOk: confirm }));
    if (!confirm) {
      resetPath();
    }
  };

  return (
    <>
      {showPrompt && (
        // <ConfirmModal
        //   show={showPrompt}
        //   primaryBtnAction={() => {
        //     handleConfirm(false);
        //   }}
        //   onClose={() => {
        //     handleToggleShow();
        //     resetPath();
        //   }}
        //   title={t("You Have Unsaved Changes")}
        //   titleDataTestId="unsaved-changes-title"
        //   message={<CustomInfo heading={t("Note")} content={message} dataTestId="unsaved-changes-info"/>}
        //   messageSecondary={t(secondaryMessage)}
        //   secondaryBtnAction={() => {
        //     handleConfirm(true);
        //   }}
        //   primaryBtnText={t("Stay in the Editor")}
        //   secondaryBtnText={t("Discard Changes and Leave the Page")}
        //   secondoryBtndataTestid="discard-action-button"
        //   primaryBtndataTestid="stay-in-editor-button"
        //   primaryBtnariaLabel={t("Stay in the Editor")}
        //   secondoryBtnariaLabel={t("Discard Changes and Leave the Page")}
        // />

        <PromptModal
          type="info"
          show={showPrompt}
          onClose={() => {
            handleToggleShow();
            resetPath();
          }}
          title={t("You Have Unsaved Changes")}
          titleDataTestId="unsaved-changes-title"
          message={t(message)}
          messageSecondary={t(secondaryMessage)}
          primaryBtnText={t("Save")}
          primaryBtndataTestid="save-action-button"
          primaryBtnariaLabel={t("Save Changes")}
          primaryBtnAction={() => {
            handleConfirm(false);
          }}
          secondaryBtnText={t("Discard Changes")}
          secondoryBtndataTestid="discard-action-button"
          secondoryBtnariaLabel={t("Discard Changes")}
          secondaryBtnAction={() => {
            handleConfirm(true);
          }}
        />
      )}
    </>
  );
});

NavigateBlocker.propTypes = {
  isBlock: PropTypes.bool.isRequired,
  message: PropTypes.string,
  secondaryMessage: PropTypes.string,
};

export default NavigateBlocker;
