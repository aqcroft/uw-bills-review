const CONFIG = {
  appsScriptUrl: "",
};

const form = document.querySelector("#reviewForm");
const formMessage = document.querySelector("#formMessage");
const submitButton = document.querySelector("#submitButton");
const successPanel = document.querySelector("#successPanel");
const closeSuccess = document.querySelector("#closeSuccess");
const sectionToggles = document.querySelectorAll("[data-section-toggle]");
const serviceJumpButtons = document.querySelectorAll("[data-service-jump]");

function showMessage(message) {
  formMessage.textContent = message;
  formMessage.hidden = false;
}

function clearMessage() {
  formMessage.textContent = "";
  formMessage.hidden = true;
}

function normalisePostcode(postcode) {
  return postcode.trim().toUpperCase().replace(/\s+/g, " ");
}

function getRadioValue(formData, fieldName) {
  return formData.get(fieldName) || "";
}

function getSelectedValues(formData, fieldName) {
  return formData.getAll(fieldName).join(", ");
}

function getField(formData, fieldName) {
  return String(formData.get(fieldName) || "").trim();
}

function syncServiceSections() {
  sectionToggles.forEach((toggle) => {
    const section = document.querySelector(`#${toggle.dataset.sectionToggle}`);
    if (section) {
      section.hidden = !toggle.checked;
    }
  });
}

function selectService(serviceName) {
  const toggle = document.querySelector(`[name="reviewServices"][value="${serviceName}"]`);
  const section = document.querySelector(`[data-service-section="${serviceName}"]`);

  if (toggle) {
    toggle.checked = true;
    syncServiceSections();
  }

  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function buildPayload() {
  const formData = new FormData(form);

  return {
    submittedAt: new Date().toISOString(),
    firstName: getField(formData, "firstName"),
    postcode: normalisePostcode(getField(formData, "postcode")),
    contactPreference: getRadioValue(formData, "contactPreference"),
    phone: getField(formData, "phone"),
    email: getField(formData, "email"),
    reviewServices: getSelectedValues(formData, "reviewServices"),
    energyProvider: getField(formData, "energyProvider"),
    energyMonthlyCost: getField(formData, "energyMonthlyCost"),
    energyFuel: getRadioValue(formData, "energyFuel"),
    energyTariff: getRadioValue(formData, "energyTariff"),
    broadbandProvider: getField(formData, "broadbandProvider"),
    broadbandMonthlyCost: getField(formData, "broadbandMonthlyCost"),
    broadbandSpeed: getField(formData, "broadbandSpeed"),
    broadbandBundle: getField(formData, "broadbandBundle"),
    broadbandIssues: getField(formData, "broadbandIssues"),
    mobileProvider: getField(formData, "mobileProvider"),
    mobileSimCount: getField(formData, "mobileSimCount"),
    mobileMonthlyCost: getField(formData, "mobileMonthlyCost"),
    mobileContract: getField(formData, "mobileContract"),
    mobileMustHaves: getField(formData, "mobileMustHaves"),
    insuranceInfo: getRadioValue(formData, "insuranceInfo"),
    mainPriority: getRadioValue(formData, "mainPriority"),
    notes: getField(formData, "notes"),
    website: getField(formData, "website"),
    source: "uw-bills-review",
  };
}

function validatePayload(payload) {
  if (!payload.firstName) {
    return "Please add your first name.";
  }

  if (!payload.contactPreference) {
    return "Please choose the best way to contact you.";
  }

  if ((payload.contactPreference === "phone" || payload.contactPreference === "whatsapp") && !payload.phone) {
    return "Please add a phone or WhatsApp number.";
  }

  if (payload.contactPreference === "email" && !payload.email) {
    return "Please add an email address.";
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return "Please enter a valid email address.";
  }

  if (!payload.reviewServices) {
    return "Please choose at least one bill to review.";
  }

  return "";
}

async function submitReview(payload) {
  if (!CONFIG.appsScriptUrl) {
    throw new Error("The form endpoint has not been configured yet.");
  }

  await fetch(CONFIG.appsScriptUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });
}

sectionToggles.forEach((toggle) => {
  toggle.addEventListener("change", syncServiceSections);
});

serviceJumpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectService(button.dataset.serviceJump);
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const payload = buildPayload();
  const validationMessage = validatePayload(payload);

  if (validationMessage) {
    showMessage(validationMessage);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    await submitReview(payload);
    successPanel.hidden = false;
    form.reset();
    syncServiceSections();
  } catch (error) {
    showMessage(error.message || "Something went wrong. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send bills snapshot";
  }
});

closeSuccess.addEventListener("click", () => {
  successPanel.hidden = true;
});

syncServiceSections();
