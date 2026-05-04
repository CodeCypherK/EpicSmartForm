const assert = require("assert");

const calculator = require("../smartforms/tch-afrezza-calculator");

function runTest(name, fn) {
  try {
    fn();
    console.log("ok - " + name);
  } catch (error) {
    console.error("not ok - " + name);
    throw error;
  }
}

runTest("parses blank and non-numeric input as zero", function () {
  const result = calculator.calculate({
    IN_BREAKFAST: "",
    IN_LUNCH: "abc",
    IN_DINNER: "4",
    IN_SNACKS: null
  });

  assert.strictEqual(result.status, "ok");
  assert.deepStrictEqual(result.inputs, {
    breakfast: 0,
    lunch: 0,
    dinner: 4,
    snacks: 0
  });
});

runTest("rounds meal inputs using source cartridge thresholds", function () {
  assert.strictEqual(calculator.roundToCartridge(0), 4);
  assert.strictEqual(calculator.roundToCartridge(3.99), 4);
  assert.strictEqual(calculator.roundToCartridge(4), 8);
  assert.strictEqual(calculator.roundToCartridge(5.99), 8);
  assert.strictEqual(calculator.roundToCartridge(6), 12);
  assert.strictEqual(calculator.roundToCartridge(7.99), 12);
  assert.strictEqual(calculator.roundToCartridge(8), 16);
  assert.strictEqual(calculator.roundToCartridge(24), 16);
});

runTest("stops without outputs when breakfast lunch and dinner are zero", function () {
  const result = calculator.calculate({
    IN_BREAKFAST: 0,
    IN_LUNCH: 0,
    IN_DINNER: 0,
    IN_SNACKS: 10
  });

  assert.strictEqual(result.status, "stopped");
  assert.strictEqual(result.reason, "no-breakfast-lunch-dinner");
  assert.deepStrictEqual(result.fields, {});
  assert.deepStrictEqual(result.errors, {
    ERR_BREAKFAST: "",
    ERR_LUNCH: "",
    ERR_DINNER: "",
    ERR_SNACKS: "",
    ERR_GENERAL: ""
  });
});

runTest("sets field-level max errors and stops calculation", function () {
  const result = calculator.calculate({
    IN_BREAKFAST: 25,
    IN_LUNCH: 24,
    IN_DINNER: 26,
    IN_SNACKS: 30
  });

  assert.strictEqual(result.status, "error");
  assert.strictEqual(result.reason, "max");
  assert.deepStrictEqual(result.fields, {});
  assert.deepStrictEqual(result.errors, {
    ERR_BREAKFAST: "Maximum is 24",
    ERR_LUNCH: "",
    ERR_DINNER: "Maximum is 24",
    ERR_SNACKS: "Maximum is 24",
    ERR_GENERAL: ""
  });
});

runTest("calculates 16-unit bucket recommendation", function () {
  const result = calculator.calculate({
    IN_BREAKFAST: 1,
    IN_LUNCH: 1,
    IN_DINNER: 1,
    IN_SNACKS: 0
  });

  assert.strictEqual(result.status, "ok");
  assert.deepStrictEqual(result.fields, {
    OP_BREAKFAST: 4,
    OP_LUNCH: 4,
    OP_DINNER: 4,
    OP_SNACKS: 0,
    CALC_DAILY_TOTAL: 12,
    DAILY_BUCKET: 16,
    REC_DAILY: 12,
    REC_MONTHLY: 480,
    REC_RANGE: "4",
    REC_NDC: "NDC# 47918-0874-90",
    REC_BOXES: 2,
    REC_CARTRIDGES: 180,
    REC_UNITS: 720,
    REC_DESC: "4-unit",
    MTDD: 12
  });
  assert.strictEqual(result.boxLabel, "boxes");
});

runTest("calculates 32-unit bucket recommendation", function () {
  const result = calculator.calculate({
    IN_BREAKFAST: 4,
    IN_LUNCH: 6,
    IN_DINNER: 8,
    IN_SNACKS: 0
  });

  assert.strictEqual(result.status, "ok");
  assert.strictEqual(result.fields.CALC_DAILY_TOTAL, 32);
  assert.strictEqual(result.fields.DAILY_BUCKET, 32);
  assert.strictEqual(result.fields.REC_MONTHLY, 960);
  assert.strictEqual(result.fields.REC_RANGE, "4 to 8");
  assert.strictEqual(result.fields.REC_NDC, "NDC# 47918-0880-18");
  assert.strictEqual(result.fields.REC_BOXES, 1);
  assert.strictEqual(result.boxLabel, "box");
});

runTest("calculates 48-unit bucket recommendation", function () {
  const result = calculator.calculate({
    IN_BREAKFAST: 8,
    IN_LUNCH: 8,
    IN_DINNER: 8,
    IN_SNACKS: 0
  });

  assert.strictEqual(result.status, "ok");
  assert.strictEqual(result.fields.CALC_DAILY_TOTAL, 48);
  assert.strictEqual(result.fields.DAILY_BUCKET, 48);
  assert.strictEqual(result.fields.REC_MONTHLY, 1440);
  assert.strictEqual(result.fields.REC_RANGE, "8 to 12");
  assert.strictEqual(result.fields.REC_NDC, "NDC# 47918-0898-18");
  assert.strictEqual(result.fields.REC_BOXES, 1);
});

runTest("calculates 49-plus bucket recommendation", function () {
  const result = calculator.calculate({
    IN_BREAKFAST: 8,
    IN_LUNCH: 8,
    IN_DINNER: 8,
    IN_SNACKS: 8
  });

  assert.strictEqual(result.status, "ok");
  assert.strictEqual(result.fields.CALC_DAILY_TOTAL, 64);
  assert.strictEqual(result.fields.DAILY_BUCKET, 49);
  assert.strictEqual(result.fields.REC_MONTHLY, 1920);
  assert.strictEqual(result.fields.REC_RANGE, "4 to 12");
  assert.strictEqual(result.fields.REC_NDC, "NDC# 47918-0902-18");
  assert.strictEqual(result.fields.REC_BOXES, 2);
  assert.strictEqual(result.fields.REC_CARTRIDGES, 360);
  assert.strictEqual(result.fields.REC_UNITS, 2880);
  assert.strictEqual(result.fields.REC_DESC, "4, 8 & 12-unit");
});

runTest("reads and writes through SmartForm value adapter", function () {
  const api = {
    values: {
      TCH_AFREZZA_IN_BREAKFAST: 4,
      TCH_AFREZZA_IN_LUNCH: 6,
      TCH_AFREZZA_IN_DINNER: 8,
      TCH_AFREZZA_IN_SNACKS: 0
    }
  };

  const result = calculator.applyToSmartForm(api);

  assert.strictEqual(result.status, "ok");
  assert.strictEqual(api.values.TCH_AFREZZA_OP_BREAKFAST, 8);
  assert.strictEqual(api.values.TCH_AFREZZA_OP_LUNCH, 12);
  assert.strictEqual(api.values.TCH_AFREZZA_OP_DINNER, 16);
  assert.strictEqual(api.values.TCH_AFREZZA_OP_SNACKS, 0);
  assert.strictEqual(api.values.TCH_AFREZZA_CALC_DAILY_TOTAL, 36);
  assert.strictEqual(api.values.TCH_AFREZZA_DAILY_BUCKET, 48);
  assert.strictEqual(api.values.TCH_AFREZZA_REC_NDC, "NDC# 47918-0898-18");
  assert.strictEqual(api.values.TCH_AFREZZA_ERR_BREAKFAST, "");
  assert.strictEqual(api.values.TCH_AFREZZA_ERR_MTDD, 36);
});
