const CONFIG = {
  appsScriptUrl: "",
};

const form = document.querySelector("#reviewForm");
const formMessage = document.querySelector("#formMessage");
const submitButton = document.querySelector("#submitButton");
const successPanel = document.querySelector("#successPanel");
const closeSuccess = document.querySelector("#closeSuccess");
const serviceButtons = document.querySelectorAll("[data-service-toggle]");
const accordionSections = document.querySelectorAll("[data-service-section]");
const mobileSimCount = document.querySelector("#mobileSimCount");
const simList = document.querySelector("#simList");
const simTemplate = document.querySelector("#simTemplate");
const economy7 = document.querySelector("#economy7");
const economy7Details = document.querySelector("#economy7Details");

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

function getPanelForService(serviceName) {
  return document.querySelector(`[data-service-section="${serviceName}"] .accordion-panel`);
}

function getTriggerForService(serviceName) {
  return document.querySelector(`[data-service-section="${serviceName}"] .accordion-trigger`);
}

function setAccordionState(serviceName, shouldOpen, shouldScroll = false) {
  const panel = getPanelForService(serviceName);
  const trigger = getTriggerForService(serviceName);
  const topButton = document.querySelector(`[data-service-toggle="${serviceName}"]`);

  if (!panel || !trigger) {
    return;
  }

  panel.hidden = !shouldOpen;
  trigger.setAttribute("aria-expanded", String(shouldOpen));
  trigger.querySelector(".accordion-state").textContent = shouldOpen ? "Click to hide" : "Click to open";

  if (topButton) {
    topButton.classList.toggle("is-selected", shouldOpen);
    topButton.setAttribute("aria-expanded", String(shouldOpen));
  }

  if (shouldOpen && shouldScroll) {
    trigger.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function toggleAccordion(serviceName, shouldScroll = false) {
  const panel = getPanelForService(serviceName);
  setAccordionState(serviceName, panel ? panel.hidden : true, shouldScroll);
}

function getOpenServices() {
  return Array.from(accordionSections)
    .filter((section) => !section.querySelector(".accordion-panel").hidden)
    .map((section) => section.dataset.serviceSection)
    .join(", ");
}

function buildSimRows() {
  const count = Math.min(Math.max(Number.parseInt(mobileSimCount.value || "0", 10) || 0, 0), 12);
  const existing = collectSimDetails();

  simList.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const clone = simTemplate.content.cloneNode(true);
    const card = clone.querySelector(".sim-card");
    const simNumber = index + 1;

    card.dataset.simIndex = String(index);
    clone.querySelector("[data-sim-number]").textContent = String(simNumber);
    clone.querySelectorAll("[data-sim-field]").forEach((field) => {
      const fieldName = field.dataset.simField;
      field.name = `sim${simNumber}_${fieldName}`;
      field.id = `sim${simNumber}_${fieldName}`;

      if (existing[index] && existing[index][fieldName]) {
        field.value = existing[index][fieldName];
      }
    });

    simList.appendChild(clone);
  }
}

function collectSimDetails() {
  return Array.from(simList.querySelectorAll(".sim-card")).map((card, index) => {
    const details = { simNumber: index + 1 };

    card.querySelectorAll("[data-sim-field]").forEach((field) => {
      details[field.dataset.simField] = field.value.trim();
    });

    return details;
  });
}

function buildPayload() {
  const formData = new FormData(form);
  const mobileSims = collectSimDetails();

  return {
    submittedAt: new Date().toISOString(),
    firstName: getField(formData, "firstName"),
    postcode: normalisePostcode(getField(formData, "postcode")),
    contactPreference: getRadioValue(formData, "contactPreference"),
    phone: getField(formData, "phone"),
    email: getField(formData, "email"),
    reviewServices: getOpenServices(),
    energyProvider: getField(formData, "energyProvider"),
    energyMonthlyCost: getField(formData, "energyMonthlyCost"),
    energyContract: getField(formData, "energyContract"),
    energyElectricUsage: getField(formData, "energyElectricUsage"),
    energyGasUsage: getField(formData, "energyGasUsage"),
    economy7: formData.get("economy7") === "yes" ? "yes" : "no",
    economy7DayUsage: getField(formData, "economy7DayUsage"),
    economy7NightUsage: getField(formData, "economy7NightUsage"),
    energyFuel: getRadioValue(formData, "energyFuel"),
    energyNotes: getField(formData, "energyNotes"),
    broadbandProvider: getField(formData, "broadbandProvider"),
    broadbandMonthlyCost: getField(formData, "broadbandMonthlyCost"),
    broadbandSpeed: getField(formData, "broadbandSpeed"),
    broadbandBundle: getField(formData, "broadbandBundle"),
    broadbandBoosters: getRadioValue(formData, "broadbandBoosters"),
    broadbandIssues: getField(formData, "broadbandIssues"),
    mobileSimCount: getField(formData, "mobileSimCount"),
    mobileMonthlyCost: getField(formData, "mobileMonthlyCost"),
    mobileHouseholdNotes: getField(formData, "mobileHouseholdNotes"),
    mobileSimsJson: JSON.stringify(mobileSims),
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
    return "Please open at least one bill section using the buttons near the top.";
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

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    toggleAccordion(button.dataset.serviceToggle, true);
  });
});

accordionSections.forEach((section) => {
  const trigger = section.querySelector(".accordion-trigger");
  trigger.addEventListener("click", () => {
    toggleAccordion(section.dataset.serviceSection);
  });
});

mobileSimCount.addEventListener("input", buildSimRows);

economy7.addEventListener("change", () => {
  economy7Details.hidden = !economy7.checked;
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
    simList.innerHTML = "";
    economy7Details.hidden = true;
    accordionSections.forEach((section) => setAccordionState(section.dataset.serviceSection, false));
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
