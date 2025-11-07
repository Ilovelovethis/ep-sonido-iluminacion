import "../styles/styles.css";
import "./globals.js";
import "../styles/contacto.css";

// EPSI form
const mainForm = document.getElementById("contact-form");
const emailInput = document.getElementById("email");
const andOrPara = document.querySelector(".and-or-para");
const phoneInput = document.getElementById("phone");
const extraFieldset = document.querySelector(".contact-extra-fieldset");
const extraButton = document.getElementById("extra-button");
const submitButton = document.getElementById("submit-button");
const barLoader = document.querySelector(".loader");
const formModal = document.getElementById("form-modal");
const formModalSetText = formModal.querySelector("p");
const initialText = formModalSetText.innerText;
const formModalButton = document.getElementById("form-modal-button");

let extraShown = false;

// Show extra fieldset
extraButton.addEventListener("click", (e) => {
  e.preventDefault();

  extraShown = !extraShown;

  if (extraShown) {
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

// AJAX operations with formspree
mainForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (emailInput.value === "" || phoneInput.value === "") {
    if (phoneInput.value === "" && emailInput.value === "") {
      emailInput.focus();
      emailInput.scrollIntoView();
      andOrPara.classList.add("yellow");
      return;
    }
  }

  andOrPara.classList.remove("yellow");
  barLoader.classList.add("shown");
  submitButton.disabled = true;
  extraButton.disabled = true;

  const formData = new FormData(mainForm);

  try {
    const response = await fetch(mainForm.action, {
      method: mainForm.method,
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      setTimeout(() => {
        barLoader.style.opacity = "0";
        setTimeout(() => {
          barLoader.classList.remove("shown");
          barLoader.style.opacity = "unset";
        }, 171);
        formModal.show();
        submitButton.disabled = false;
        extraButton.disabled = false;
      }, 2800);

      setTimeout(() => {
        formModal.style.opacity = "0";
        setTimeout(() => {
          formModal.style.opacity = "unset";
          formModal.close();
        }, 1000);
      }, 10000);

      setTimeout(() => {
        mainForm.reset();
      }, 2500);
    } else {
      const data = await response.json();

      formModalSetText.innerText = data.errors
        ? data.errors.map((error) => error.message).join(", ")
        : "¡Error al enviar!";
      formModal.show();

      barLoader.classList.add("failed");
      formModal.classList.add("failed");

      setTimeout(() => {
        barLoader.style.opacity = "0";
        setTimeout(() => {
          barLoader.classList.remove("shown");
          barLoader.style.opacity = "unset";
          barLoader.classList.remove("failed");
        }, 1000);

        formModal.style.opacity = "0";
        setTimeout(() => {
          formModal.close();
          formModal.style.opacity = "unset";
          formModal.classList.remove("failed");
          formModalSetText.innerText = initialText;
        }, 1000);

        submitButton.disabled = false;
        extraButton.disabled = false;
      }, 10000);
    }
  } catch (error) {
    formModalSetText.innerText = "¡Ocurrió un error!";
    formModal.show();

    barLoader.classList.add("failed");
    formModal.classList.add("failed");
    setTimeout(() => {
      barLoader.style.opacity = "0";

      setTimeout(() => {
        barLoader.classList.remove("shown");
        barLoader.style.opacity = "unset";
        barLoader.classList.remove("failed");
      }, 1000);

      formModal.style.opacity = "0";

      setTimeout(() => {
        formModal.close();
        formModal.style.opacity = "unset";
        formModal.classList.remove("failed");
        formModalSetText.innerText = initialText;
      }, 1000);

      submitButton.disabled = false;
      extraButton.disabled = false;
    }, 10000);
  }
});

formModalButton.addEventListener("click", () => {
  formModal.style.opacity = "0";
  setTimeout(() => {
    formModal.close();
    formModal.style.opacity = "unset";
  }, 1000);
});

// Dev form
const openDevModal = document.getElementById("open-dev-modal");
const devContactModal = document.getElementById("dev-contact-dialog");
const closeDevModalButton = document.getElementById("close-dev-modal-button");
const devForm = document.getElementById("dev-contact-form");
const devSubmitButton = document.getElementById("dev-submit-button");
const devBarLoader = document.querySelector(".loader.dev");
const devFormModal = document.getElementById("dev-form-modal");
const devFormModalSetText = devFormModal.querySelector("p");
const devInitialText = devFormModalSetText.innerText;
const devFormModalButton = document.getElementById("dev-form-modal-button");

openDevModal.addEventListener("click", (e) => {
  e.preventDefault();
  devContactModal.showModal();
  document.body.classList.add("no-scroll");
});

closeDevModalButton.addEventListener("click", (e) => {
  e.preventDefault();
  setTimeout(() => {
    devContactModal.close();
    document.body.classList.remove("no-scroll");
    devContactModal.style.removeProperty("--modal-opacity");
  }, 1100);
  devContactModal.style.setProperty("--modal-opacity", "0");
});

devContactModal.addEventListener("cancel", (e) => {
  e.preventDefault();
  setTimeout(() => {
    devContactModal.close();
    document.body.classList.remove("no-scroll");
    devContactModal.style.removeProperty("--modal-opacity");
  }, 1100);
  devContactModal.style.setProperty("--modal-opacity", "0");
});

// AJAX operations with formspree
devForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  devBarLoader.classList.add("shown");
  devSubmitButton.disabled = true;

  const formData = new FormData(devForm);

  try {
    const response = await fetch(devForm.action, {
      method: devForm.method,
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      setTimeout(() => {
        devBarLoader.style.opacity = "0";
        setTimeout(() => {
          devBarLoader.classList.remove("shown");
          devBarLoader.style.opacity = "unset";
        }, 171);
        devFormModal.show();
        devSubmitButton.disabled = false;
      }, 2800);

      setTimeout(() => {
        devFormModal.style.opacity = "0";
        setTimeout(() => {
          devFormModal.style.opacity = "unset";
          devFormModal.close();
        }, 1000);
      }, 10000);

      setTimeout(() => {
        setTimeout(() => {
          devContactModal.close();
          document.body.classList.remove("no-scroll");
          devContactModal.style.removeProperty("--modal-opacity");
        }, 1100);
        devContactModal.style.setProperty("--modal-opacity", "0");
        devForm.reset();
      }, 2500);
    } else {
      const data = await response.json();

      devFormModalSetText.innerText = data.errors
        ? data.errors.map((error) => error.message).join(", ")
        : "¡Error al enviar!";
      devFormModal.show();

      devBarLoader.classList.add("failed");
      devFormModal.classList.add("failed");

      setTimeout(() => {
        devBarLoader.style.opacity = "0";
        setTimeout(() => {
          devBarLoader.classList.remove("shown");
          devBarLoader.style.opacity = "unset";
          devBarLoader.classList.remove("failed");
        }, 1000);

        devFormModal.style.opacity = "0";
        setTimeout(() => {
          devFormModal.close();
          devFormModal.style.opacity = "unset";
          devFormModal.classList.remove("failed");
          devFormModalSetText.innerText = devInitialText;
        }, 1000);

        devSubmitButton.disabled = false;
      }, 10000);
    }
  } catch (error) {
    devFormModalSetText.innerText = "¡Ocurrió un error!";
    devFormModal.show();

    devBarLoader.classList.add("failed");
    devFormModal.classList.add("failed");
    setTimeout(() => {
      devBarLoader.style.opacity = "0";

      setTimeout(() => {
        devBarLoader.classList.remove("shown");
        devBarLoader.style.opacity = "unset";
        devBarLoader.classList.remove("failed");
      }, 1000);

      devFormModal.style.opacity = "0";

      setTimeout(() => {
        devFormModal.close();
        devFormModal.style.opacity = "unset";
        devFormModal.classList.remove("failed");
        devFormModalSetText.innerText = devInitialText;
      }, 1000);

      devSubmitButton.disabled = false;
    }, 10000);
  }
});

devFormModalButton.addEventListener("click", () => {
  devFormModal.style.opacity = "0";
  setTimeout(() => {
    devFormModal.close();
    devFormModal.style.opacity = "unset";
  }, 1000);
});
