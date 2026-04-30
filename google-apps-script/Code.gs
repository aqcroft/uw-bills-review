const SHEET_NAME = 'Bills Review Responses';

const HEADERS = [
  'submittedAt',
  'firstName',
  'postcode',
  'contactPreference',
  'phone',
  'email',
  'reviewServices',
  'energyProvider',
  'energyMonthlyCost',
  'energyContract',
  'energyElectricUsage',
  'energyGasUsage',
  'economy7',
  'economy7DayUsage',
  'economy7NightUsage',
  'energyFuel',
  'energyNotes',
  'broadbandProvider',
  'broadbandMonthlyCost',
  'broadbandSpeed',
  'broadbandBundle',
  'broadbandBoosters',
  'broadbandIssues',
  'mobileSimCount',
  'mobileMonthlyCost',
  'mobileHouseholdNotes',
  'mobileSimsJson',
  'insuranceInfo',
  'mainPriority',
  'notes',
  'website',
  'source',
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');

    if (payload.website) {
      return jsonResponse({ ok: true, ignored: true });
    }

    const sheet = getOrCreateSheet();
    ensureHeaders(sheet);
    sheet.appendRow(HEADERS.map((header) => payload[header] || ''));

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders(sheet) {
  const existingHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = existingHeaders.some(Boolean);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
