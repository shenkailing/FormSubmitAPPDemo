# Cross-Device Form + Signature Demo

A single-page H5 demo that works on iOS Safari, Android Chrome, and desktop browsers.

## Features

- Mobile-first responsive form layout
- Handwritten signature using HTML Canvas + Pointer Events
- Clear and undo signature actions
- Form validation (name, phone, email, date, consent, signature)
- JSON payload preview with signature as Base64 PNG
- Copy JSON to clipboard

## Run

No build step needed.

1. Open `index.html` directly in a browser, or
2. Use a local static server for best compatibility:

```bash
# Option A (Node)
npx serve .

# Option B (Python)
python3 -m http.server 8080
```

Then visit the local URL on your phone and desktop under the same LAN.

## Notes

- This is a demo page and does not send data to a backend.
- To make it production-ready, connect submit logic to your API and store the PNG signature securely.
