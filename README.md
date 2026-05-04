# EpicSmartForm

This repository contains implementation-ready Epic SmartForm scripting artifacts.

## TCH Afrezza calculator

- Script: `smartforms/tch-afrezza-calculator.js`
- Validation tests: `test/tch-afrezza-calculator.test.js`

The script implements the Afrezza SmartForm logic for the `TCHAMBENDOAFREZZA`
SmartData Elements:

1. Reads breakfast, lunch, dinner, and snacks input SDEs.
2. Treats blank, null, and non-numeric input as `0`.
3. Stops calculation and writes per-field errors when any input is greater than
   `24`.
4. Mirrors the source calculator's "at least one meal" rule: breakfast, lunch,
   or dinner must be non-zero; snacks alone does not produce a result.
5. Converts meal values to 4/8/12/16 cartridge values.
6. Calculates daily total, recommendation bucket, NDC, boxes, cartridges, units,
   description, monthly total, range, and MTDD.

### Epic wiring

Paste or import `smartforms/tch-afrezza-calculator.js` into the SmartForm
scripting area. Call the exported handlers from the form load event and each
meal input change event:

```javascript
TchAfrezzaSmartForm.onLoad(SmartForm);
TchAfrezzaSmartForm.onInputChanged(SmartForm);
```

If the local Epic scripting API uses different read/write method names, adjust
the adapter functions in `readValue` and `writeValue`. The pure calculator logic
is isolated in `TchAfrezzaSmartForm.calculate(...)`.

### Local validation

Run the tests with:

```sh
node test/tch-afrezza-calculator.test.js
```
