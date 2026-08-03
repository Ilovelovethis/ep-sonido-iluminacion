import "../styles/styles.css";
import "./globals.js";
import "../styles/contacto.css";

const TIMEOUTS = {
  loaderHiding: 171,
  formUnexpand: 900,
  modalClosing: 500,
  modalAutoClose: 10000,
  formReset: 2500,
  submitDebounce: 2800,
  modalAnimation: 750,
  backdropClosing: 750,
};

// Helper Functions --.

/**
 * Formats date and sets it into a hidden input
 * @param {HTMLInputElement} inputEl - Date input element
 * @param {HTMLInputElement} formattedInput - Hidden input element
 * @param {Object} formatOptions - Intl.DateTimeFormat options
 */
const formatDateAndSet = (inputEl, formattedInput, formatOptions) => {
  const date = new Date(inputEl.value);
  if (isNaN(date.getTime())) {
    formattedInput.value = "";
    return;
  }

  const friendlyDate = date.toLocaleString("es-AR", formatOptions);
  // We still have the month non-capitalized, only the day of the week is
  const finalString =
    friendlyDate.charAt(0).toUpperCase() + friendlyDate.slice(1);

  formattedInput.value = finalString;
};

/**
 * Closes a modal with fade-out animation and reset styles
 * @param {HTMLElement} modal - Modal element to close
 * @param {string} bodyClass - Optional body class to remove
 */
const closeModalWithAnimation = (modal, bodyClass = null) => {
  if (modal._autoCloseTimeout) {
    clearTimeout(modal._autoCloseTimeout);
    modal._autoCloseTimeout = null;
  }
  if (modal._opacityTimeout) {
    clearTimeout(modal._opacityTimeout);
    modal._opacityTimeout = null;
  }
  if (modal._closeTimeout) {
    clearTimeout(modal._closeTimeout);
    modal._closeTimeout = null;
  }

  // If there's an active error state cleanup, run it immediately on manual close
  if (typeof modal._errorCleanup === "function") {
    modal._errorCleanup();
    modal._errorCleanup = null;
  }

  if (modal.classList.contains("form-modal")) {
    modal.style.opacity = "0";
    modal.style.translate = "0 0.5rem";
  } else {
    modal.style.setProperty("--modal-opacity", "0");
    modal.style.setProperty("--modal-translate", "0 2.25rem");
  }

  const closingTimeout = modal.classList.contains("form-modal")
    ? TIMEOUTS.modalAnimation
    : TIMEOUTS.backdropClosing;

  modal._closeTimeout = setTimeout(() => {
    modal.close();

    if (bodyClass) document.body.classList.remove(bodyClass);
    if (modal.classList.contains("form-modal")) {
      modal.style.removeProperty("opacity");
      modal.style.removeProperty("translate");
    } else {
      modal.style.removeProperty("--modal-opacity");
      modal.style.removeProperty("--modal-translate");
    }
    modal._closeTimeout = null;
  }, closingTimeout);
};

const validateFields = (emailInput, phoneInput, andOrPara) => {
  // Either one or the other is required, and the other is optional (AND/OR)
  if (emailInput.value.trim() === "" || phoneInput.value.trim() === "") {
    // We stop here if one of them is filled
    if (emailInput.value.trim() === "" && phoneInput.value.trim() === "") {
      emailInput.focus();
      emailInput.scrollIntoView();
      andOrPara.classList.add("yellow");
      emailInput.setAttribute("aria-invalid", "true");
      phoneInput.setAttribute("aria-invalid", "true");

      return false;
    }
  }

  clearValidationWarning();

  return true;
};

/**
 * Handles AJAX form submission and reset, with loading and modal feedback
 */
const handleFormSubmit = async ({ e, config, modalConfig }) => {
  e.preventDefault();

  // Validate if required fields are provided
  if (
    config.emailInput &&
    config.phoneInput &&
    !validateFields(config.emailInput, config.phoneInput, config.andOrPara)
  )
    return;

  if (config.loader) config.loader.classList.add("shown");
  if (config.submitButton) config.submitButton.disabled = true;
  if (config.extraButton) config.extraButton.disabled = true;

  try {
    const response = await fetch(e.target.action, {
      method: e.target.method,
      body: new FormData(e.target),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      showSuccessState(config.loader, modalConfig.modal, config.submitButton, {
        ...config,
        form: e.target,
      });
    } else {
      const data = await response.json();

      showErrorState({
        loader: config.loader,
        modal: modalConfig.modal,
        modalSetText: modalConfig.modalSetText,
        initialText: modalConfig.initialText,
        submitButton: config.submitButton,
        config,
        data,
      });
    }
  } catch (error) {
    showErrorState({
      loader: config.loader,
      modal: modalConfig.modal,
      modalSetText: modalConfig.modalSetText,
      initialText: modalConfig.initialText,
      submitButton: config.submitButton,
      config,
    });
  }
};

/**
 * Shows success state and resets form after submission
 */
const showSuccessState = (loader, modal, submitButton, config) => {
  if (modal._autoCloseTimeout) clearTimeout(modal._autoCloseTimeout);
  if (modal._opacityTimeout) clearTimeout(modal._opacityTimeout);
  if (modal._closeTimeout) clearTimeout(modal._closeTimeout);
  if (modal._errorCleanup) {
    modal._errorCleanup = null;
  }

  // Clear any failed classes from previous attempts
  loader.classList.remove("failed");
  modal.classList.remove("failed");

  setTimeout(() => {
    loader.style.opacity = "0";

    setTimeout(() => {
      loader.classList.remove("shown");
      loader.style.opacity = "unset";
    }, TIMEOUTS.loaderHiding);

    modal.show();
    submitButton.disabled = false;
    if (config.extraButton) config.extraButton.disabled = false;
  }, TIMEOUTS.submitDebounce);

  modal._autoCloseTimeout = setTimeout(() => {
    modal.style.opacity = "0";

    modal._opacityTimeout = setTimeout(() => {
      modal.style.opacity = "unset";
      modal.close();
    }, TIMEOUTS.modalClosing);
  }, TIMEOUTS.modalAutoClose);

  setTimeout(() => {
    if (config.form) config.form.reset();
  }, TIMEOUTS.formReset);

  // Close contact modal if present (dev form only)
  if (config.contactModal) {
    closeModalWithAnimation(config.contactModal, "no-scroll");
  }
};

/**
 * Shows error state after failed form submission
 */
const showErrorState = ({
  loader,
  modal,
  modalSetText,
  initialText,
  submitButton,
  config,
  data,
}) => {
  if (modal._autoCloseTimeout) clearTimeout(modal._autoCloseTimeout);
  if (modal._opacityTimeout) clearTimeout(modal._opacityTimeout);
  if (modal._closeTimeout) clearTimeout(modal._closeTimeout);
  if (modal._errorCleanup) {
    modal._errorCleanup();
    modal._errorCleanup = null;
  }

  modalSetText.innerText = data?.errors
    ? data.errors.map((error) => error.message).join(", ")
    : "¡Error al enviar!";
  modal.show();

  loader.classList.add("failed");
  modal.classList.add("failed");

  // Cleanup function to restore form inputs and loader state
  const performCleanup = () => {
    loader.classList.remove("shown", "failed");
    loader.style.opacity = "unset";
    modal.classList.remove("failed");
    modalSetText.innerText = initialText;
    submitButton.disabled = false;
    if (config.extraButton) config.extraButton.disabled = false;
  };

  modal._errorCleanup = performCleanup;

  modal._autoCloseTimeout = setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => {
      // Only perform cleanup if this specific run hasn't been cleared or already cleaned up
      if (modal._errorCleanup === performCleanup) {
        performCleanup();
        modal._errorCleanup = null;
      }
    }, TIMEOUTS.modalClosing);

    modal.style.opacity = "0";
    modal._opacityTimeout = setTimeout(() => {
      modal.close();
      modal.style.opacity = "unset";
    }, TIMEOUTS.modalClosing);
  }, TIMEOUTS.modalAutoClose);
};

// EPSI form --.

const mainForm = document.getElementById("contact-form");
const emailInput = document.getElementById("email");
const andOrPara = document.getElementById("and-or-para");
const phoneInput = document.getElementById("phone");
const extraFieldset = document.querySelector(".contact-extra-fieldset");
const dateToFormatEl = document.getElementById("date-calendar");
const formatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: false,
};
const dateFormattedEl = document.getElementById("date-calendar-formated");
const extraButtonEl = document.getElementById("extra-button");
let extraButtonState = false;
let _unexpandFormTimeout;
const mainSubmitButton = document.getElementById("submit-button");
const barLoader = document.querySelector(".loader");
const formModal = document.getElementById("form-modal");
const formModalSetText = formModal.querySelector("p");
const initialText = formModalSetText.innerText;
const formModalButton = document.getElementById("form-modal-button");

// Event listeners -.

extraButtonEl.addEventListener("click", () => {
  extraButtonState = !extraButtonState;

  if (extraButtonState) {
    extraFieldset.style.maxHeight = "unset";
    requestAnimationFrame(() => {
      const height = extraFieldset.scrollHeight;
      extraFieldset.style.maxHeight = "0";
      extraFieldset.scrollHeight; // This forced reflow is key; it took me ages to realize
      extraFieldset.style.maxHeight = height + "px";
      extraFieldset.style.opacity = "1";
    });
  } else {
    extraFieldset.style.maxHeight = "0";
    extraFieldset.style.opacity = "0";
  }
});

dateToFormatEl.addEventListener("change", (e) => {
  formatDateAndSet(e.target, dateFormattedEl, formatOptions);
});

mainForm.addEventListener("submit", (e) => {
  handleFormSubmit({
    e,
    config: {
      emailInput,
      phoneInput,
      andOrPara,
      loader: barLoader,
      submitButton: mainSubmitButton,
      extraButton: extraButtonEl,
    },
    modalConfig: {
      modal: formModal,
      modalSetText: formModalSetText,
      initialText,
    },
  });
});

formModalButton.addEventListener("click", () => {
  closeModalWithAnimation(formModal);
});

const clearValidationWarning = () => {
  andOrPara.classList.remove("yellow");
  emailInput.removeAttribute("aria-invalid");
  phoneInput.removeAttribute("aria-invalid");
};

emailInput.addEventListener("input", clearValidationWarning);
phoneInput.addEventListener("input", clearValidationWarning);

mainForm.addEventListener("reset", () => {
  if (_unexpandFormTimeout) clearTimeout(_unexpandFormTimeout);

  _unexpandFormTimeout = setTimeout(() => {
    extraButtonState = false;
    extraFieldset.style.maxHeight = "0";
    extraFieldset.style.opacity = "0";
    clearValidationWarning();
  }, TIMEOUTS.formUnexpand);
});

// Dev form --.

const openDevModal = document.getElementById("open-dev-modal");
const devContactModal = document.getElementById("dev-contact-dialog");
const devForm = document.getElementById("dev-contact-form");
const closeDevModalButton = document.getElementById("close-dev-modal-button");
const devSubmitButton = document.getElementById("dev-submit-button");
const devBarLoader = document.querySelector(".loader.dev");
const devFormModal = document.getElementById("dev-form-modal");
const devFormModalSetText = devFormModal.querySelector("p");
const devInitialText = devFormModalSetText.innerText;
const devFormModalButton = document.getElementById("dev-form-modal-button");

// Event listeners -.

openDevModal.addEventListener("click", (e) => {
  e.preventDefault();
  devContactModal.showModal();
  document.body.classList.add("no-scroll");
});

closeDevModalButton.addEventListener("click", (e) => {
  e.preventDefault();
  closeModalWithAnimation(devContactModal, "no-scroll");
});

devContactModal.addEventListener("cancel", (e) => {
  e.preventDefault();
  closeModalWithAnimation(devContactModal, "no-scroll");
});

devForm.addEventListener("submit", (e) => {
  handleFormSubmit({
    e,
    config: {
      loader: devBarLoader,
      submitButton: devSubmitButton,
      contactModal: devContactModal,
    },
    modalConfig: {
      modal: devFormModal,
      modalSetText: devFormModalSetText,
      initialText: devInitialText,
    },
  });
});

devFormModalButton.addEventListener("click", () => {
  closeModalWithAnimation(devFormModal);
});
