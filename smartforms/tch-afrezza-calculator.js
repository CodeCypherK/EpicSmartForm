/*
 * TCH Afrezza Epic SmartForm calculator script.
 *
 * Paste or import this script into the SmartForm scripting area, then call
 * TchAfrezzaSmartForm.applyToSmartForm(<SmartForm API/context>) from each
 * input field change event and on form load.
 */
(function (root) {
  "use strict";

  var MAXIMUM_MEAL_VALUE = 24;
  var MAXIMUM_ERROR = "Maximum is 24";

  var SDE = {
    IN_BREAKFAST: "TCH_AFREZZA_IN_BREAKFAST",
    IN_LUNCH: "TCH_AFREZZA_IN_LUNCH",
    IN_DINNER: "TCH_AFREZZA_IN_DINNER",
    IN_SNACKS: "TCH_AFREZZA_IN_SNACKS",
    OP_BREAKFAST: "TCH_AFREZZA_OP_BREAKFAST",
    OP_LUNCH: "TCH_AFREZZA_OP_LUNCH",
    OP_DINNER: "TCH_AFREZZA_OP_DINNER",
    OP_SNACKS: "TCH_AFREZZA_OP_SNACKS",
    CALC_DAILY_TOTAL: "TCH_AFREZZA_CALC_DAILY_TOTAL",
    DAILY_BUCKET: "TCH_AFREZZA_DAILY_BUCKET",
    REC_DAILY: "TCH_AFREZZA_REC_DAILY",
    REC_MONTHLY: "TCH_AFREZZA_REC_MONTHLY",
    REC_RANGE: "TCH_AFREZZA_REC_RANGE",
    REC_NDC: "TCH_AFREZZA_REC_NDC",
    REC_BOXES: "TCH_AFREZZA_REC_BOXES",
    REC_CARTRIDGES: "TCH_AFREZZA_REC_CARTRIDGES",
    REC_UNITS: "TCH_AFREZZA_REC_UNITS",
    REC_DESC: "TCH_AFREZZA_REC_DESC",
    ERR_BREAKFAST: "TCH_AFREZZA_ERR_BREAKFAST",
    ERR_LUNCH: "TCH_AFREZZA_ERR_LUNCH",
    ERR_DINNER: "TCH_AFREZZA_ERR_DINNER",
    ERR_SNACKS: "TCH_AFREZZA_ERR_SNACKS",
    ERR_GENERAL: "TCH_AFREZZA_ERR_GENERAL",

    /*
     * The provided SmartData Element is named ERR_MTDD, but the calculator
     * instructions define MTDD as the displayed max total daily dose. Store
     * REC_DAILY/CALC_DAILY_TOTAL here unless the Epic build renames the SDE.
     */
    MTDD: "TCH_AFREZZA_ERR_MTDD"
  };

  var EPIC_RECORD_IDS = {
    IN_BREAKFAST: "HLX TCHAMBENDOAFREZZA#002",
    IN_LUNCH: "HLX TCHAMBENDOAFREZZA#003",
    IN_DINNER: "HLX TCHAMBENDOAFREZZA#004",
    IN_SNACKS: "HLX TCHAMBENDOAFREZZA#005",
    OP_BREAKFAST: "HLX TCHAMBENDOAFREZZA#006",
    OP_LUNCH: "HLX TCHAMBENDOAFREZZA#007",
    OP_DINNER: "HLX TCHAMBENDOAFREZZA#008",
    OP_SNACKS: "HLX TCHAMBENDOAFREZZA#009",
    CALC_DAILY_TOTAL: "HLX TCHAMBENDOAFREZZA#010",
    DAILY_BUCKET: "HLX TCHAMBENDOAFREZZA#011",
    REC_DAILY: "HLX TCHAMBENDOAFREZZA#012",
    REC_MONTHLY: "HLX TCHAMBENDOAFREZZA#013",
    REC_RANGE: "HLX TCHAMBENDOAFREZZA#014",
    REC_NDC: "HLX TCHAMBENDOAFREZZA#015",
    REC_BOXES: "HLX TCHAMBENDOAFREZZA#016",
    REC_CARTRIDGES: "HLX TCHAMBENDOAFREZZA#017",
    REC_UNITS: "HLX TCHAMBENDOAFREZZA#018",
    REC_DESC: "HLX TCHAMBENDOAFREZZA#019",
    ERR_BREAKFAST: "HLX TCHAMBENDOAFREZZA#020",
    ERR_LUNCH: "HLX TCHAMBENDOAFREZZA#021",
    ERR_DINNER: "HLX TCHAMBENDOAFREZZA#022",
    ERR_SNACKS: "HLX TCHAMBENDOAFREZZA#023",
    ERR_GENERAL: "HLX TCHAMBENDOAFREZZA#024",
    MTDD: "HLX TCHAMBENDOAFREZZA#025"
  };

  var INPUT_KEYS = [
    "IN_BREAKFAST",
    "IN_LUNCH",
    "IN_DINNER",
    "IN_SNACKS"
  ];

  var ERROR_KEYS = [
    "ERR_BREAKFAST",
    "ERR_LUNCH",
    "ERR_DINNER",
    "ERR_SNACKS",
    "ERR_GENERAL"
  ];

  var OUTPUT_KEYS = [
    "OP_BREAKFAST",
    "OP_LUNCH",
    "OP_DINNER",
    "OP_SNACKS",
    "CALC_DAILY_TOTAL",
    "DAILY_BUCKET",
    "REC_DAILY",
    "REC_MONTHLY",
    "REC_RANGE",
    "REC_NDC",
    "REC_BOXES",
    "REC_CARTRIDGES",
    "REC_UNITS",
    "REC_DESC",
    "MTDD"
  ];

  var RECOMMENDATIONS = {
    16: {
      REC_MONTHLY: 480,
      REC_RANGE: "4",
      REC_NDC: "NDC# 47918-0874-90",
      REC_BOXES: 2,
      REC_CARTRIDGES: 180,
      REC_UNITS: 720,
      REC_DESC: "4-unit"
    },
    32: {
      REC_MONTHLY: 960,
      REC_RANGE: "4 to 8",
      REC_NDC: "NDC# 47918-0880-18",
      REC_BOXES: 1,
      REC_CARTRIDGES: 180,
      REC_UNITS: 1080,
      REC_DESC: "4 & 8-unit"
    },
    48: {
      REC_MONTHLY: 1440,
      REC_RANGE: "8 to 12",
      REC_NDC: "NDC# 47918-0898-18",
      REC_BOXES: 1,
      REC_CARTRIDGES: 180,
      REC_UNITS: 1800,
      REC_DESC: "8 & 12-unit"
    },
    49: {
      REC_MONTHLY: 1920,
      REC_RANGE: "4 to 12",
      REC_NDC: "NDC# 47918-0902-18",
      REC_BOXES: 2,
      REC_CARTRIDGES: 360,
      REC_UNITS: 2880,
      REC_DESC: "4, 8 & 12-unit"
    }
  };

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function parseInput(value) {
    var numericValue;

    if (value === null || typeof value === "undefined") {
      return 0;
    }

    if (typeof value === "string" && value.replace(/\s/g, "") === "") {
      return 0;
    }

    numericValue = Number(value);
    if (!isFinite(numericValue)) {
      return 0;
    }

    return numericValue;
  }

  function getRawInput(rawInput, key) {
    if (rawInput && hasOwn(rawInput, key)) {
      return rawInput[key];
    }

    if (rawInput && hasOwn(rawInput, SDE[key])) {
      return rawInput[SDE[key]];
    }

    return null;
  }

  function roundToCartridge(value) {
    var doubled = value * 2;

    if (doubled < 8) {
      return 4;
    }

    if (doubled < 12) {
      return 8;
    }

    if (doubled < 16) {
      return 12;
    }

    return 16;
  }

  function dailyBucket(total) {
    if (total <= 16) {
      return 16;
    }

    if (total <= 32) {
      return 32;
    }

    if (total <= 48) {
      return 48;
    }

    return 49;
  }

  function emptyErrors() {
    return {
      ERR_BREAKFAST: "",
      ERR_LUNCH: "",
      ERR_DINNER: "",
      ERR_SNACKS: "",
      ERR_GENERAL: ""
    };
  }

  function buildFieldsForBucket(total, bucket, opBreakfast, opLunch, opDinner, opSnacks) {
    var recommendation = RECOMMENDATIONS[bucket];

    return {
      OP_BREAKFAST: opBreakfast,
      OP_LUNCH: opLunch,
      OP_DINNER: opDinner,
      OP_SNACKS: opSnacks,
      CALC_DAILY_TOTAL: total,
      DAILY_BUCKET: bucket,
      REC_DAILY: total,
      REC_MONTHLY: recommendation.REC_MONTHLY,
      REC_RANGE: recommendation.REC_RANGE,
      REC_NDC: recommendation.REC_NDC,
      REC_BOXES: recommendation.REC_BOXES,
      REC_CARTRIDGES: recommendation.REC_CARTRIDGES,
      REC_UNITS: recommendation.REC_UNITS,
      REC_DESC: recommendation.REC_DESC,
      MTDD: total
    };
  }

  function calculate(rawInput) {
    var breakfast = parseInput(getRawInput(rawInput, "IN_BREAKFAST"));
    var lunch = parseInput(getRawInput(rawInput, "IN_LUNCH"));
    var dinner = parseInput(getRawInput(rawInput, "IN_DINNER"));
    var snacks = parseInput(getRawInput(rawInput, "IN_SNACKS"));
    var errors = emptyErrors();
    var hasMaxError = false;
    var opBreakfast;
    var opLunch;
    var opDinner;
    var opSnacks;
    var total;
    var bucket;
    var fields;

    if (breakfast > MAXIMUM_MEAL_VALUE) {
      errors.ERR_BREAKFAST = MAXIMUM_ERROR;
      hasMaxError = true;
    }

    if (lunch > MAXIMUM_MEAL_VALUE) {
      errors.ERR_LUNCH = MAXIMUM_ERROR;
      hasMaxError = true;
    }

    if (dinner > MAXIMUM_MEAL_VALUE) {
      errors.ERR_DINNER = MAXIMUM_ERROR;
      hasMaxError = true;
    }

    if (snacks > MAXIMUM_MEAL_VALUE) {
      errors.ERR_SNACKS = MAXIMUM_ERROR;
      hasMaxError = true;
    }

    if (hasMaxError) {
      return {
        status: "error",
        reason: "max",
        inputs: {
          breakfast: breakfast,
          lunch: lunch,
          dinner: dinner,
          snacks: snacks
        },
        errors: errors,
        fields: {}
      };
    }

    /*
     * Mirrors the source calculator exactly: snacks alone does not produce
     * a recommendation and does not set a validation error.
     */
    if (breakfast === 0 && lunch === 0 && dinner === 0) {
      return {
        status: "stopped",
        reason: "no-breakfast-lunch-dinner",
        inputs: {
          breakfast: breakfast,
          lunch: lunch,
          dinner: dinner,
          snacks: snacks
        },
        errors: errors,
        fields: {}
      };
    }

    opBreakfast = roundToCartridge(breakfast);
    opLunch = roundToCartridge(lunch);
    opDinner = roundToCartridge(dinner);
    opSnacks = snacks > 0 ? roundToCartridge(snacks) : 0;
    total = opBreakfast + opLunch + opDinner + opSnacks;
    bucket = dailyBucket(total);
    fields = buildFieldsForBucket(
      total,
      bucket,
      opBreakfast,
      opLunch,
      opDinner,
      opSnacks
    );

    return {
      status: "ok",
      reason: "",
      inputs: {
        breakfast: breakfast,
        lunch: lunch,
        dinner: dinner,
        snacks: snacks
      },
      errors: errors,
      fields: fields,
      boxLabel: fields.REC_BOXES > 1 ? "boxes" : "box"
    };
  }

  function readValue(api, sdeName) {
    if (!api) {
      return null;
    }

    if (typeof api.getSmartDataValue === "function") {
      return api.getSmartDataValue(sdeName);
    }

    if (typeof api.GetSmartDataValue === "function") {
      return api.GetSmartDataValue(sdeName);
    }

    if (typeof api.getValue === "function") {
      return api.getValue(sdeName);
    }

    if (typeof api.GetValue === "function") {
      return api.GetValue(sdeName);
    }

    if (api.values && hasOwn(api.values, sdeName)) {
      return api.values[sdeName];
    }

    return null;
  }

  function writeValue(api, sdeName, value) {
    if (!api) {
      throw new Error("A SmartForm API/context object is required.");
    }

    if (typeof api.setSmartDataValue === "function") {
      api.setSmartDataValue(sdeName, value);
      return;
    }

    if (typeof api.SetSmartDataValue === "function") {
      api.SetSmartDataValue(sdeName, value);
      return;
    }

    if (typeof api.setValue === "function") {
      api.setValue(sdeName, value);
      return;
    }

    if (typeof api.SetValue === "function") {
      api.SetValue(sdeName, value);
      return;
    }

    if (api.values) {
      api.values[sdeName] = value;
      return;
    }

    throw new Error("No supported SmartForm write method found for " + sdeName + ".");
  }

  function readInputs(api) {
    var rawInput = {};
    var i;

    for (i = 0; i < INPUT_KEYS.length; i += 1) {
      rawInput[INPUT_KEYS[i]] = readValue(api, SDE[INPUT_KEYS[i]]);
    }

    return rawInput;
  }

  function writeFields(api, fields, keys) {
    var i;
    var key;

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];
      writeValue(api, SDE[key], fields[key]);
    }
  }

  function clearFields(api, keys) {
    var i;

    for (i = 0; i < keys.length; i += 1) {
      writeValue(api, SDE[keys[i]], "");
    }
  }

  function applyToSmartForm(api) {
    var result = calculate(readInputs(api));

    clearFields(api, ERROR_KEYS);
    writeFields(api, result.errors, ERROR_KEYS);

    if (result.status !== "ok") {
      clearFields(api, OUTPUT_KEYS);
      return result;
    }

    writeFields(api, result.fields, OUTPUT_KEYS);
    return result;
  }

  function onLoad(api) {
    return applyToSmartForm(api);
  }

  function onInputChanged(api) {
    return applyToSmartForm(api);
  }

  var exported = {
    SDE: SDE,
    EPIC_RECORD_IDS: EPIC_RECORD_IDS,
    RECOMMENDATIONS: RECOMMENDATIONS,
    calculate: calculate,
    roundToCartridge: roundToCartridge,
    dailyBucket: dailyBucket,
    applyToSmartForm: applyToSmartForm,
    onLoad: onLoad,
    onInputChanged: onInputChanged
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = exported;
  } else {
    root.TchAfrezzaSmartForm = exported;
  }
}(this));
