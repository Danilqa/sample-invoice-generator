# Test Invoice Generator

> Realistic PDF invoices for testing, with random details and real bank accounts

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshot-dark.png" />
  <img width="1202" alt="Test Invoice Generator: the invoice form on the left, the PDF preview on the right" src="docs/screenshot.png" />
</picture>

**[Open the app](https://danilqa.github.io/sample-invoice-generator/)**

Every invoice is filled with random details: the customer, addresses, line items, amounts and dates. The bank details are real, though. They belong to charities and come from public sources, so the sort codes, account numbers and IBANs pass bank validation checks.

## Use cases

- Testing invoice upload and data extraction (OCR) in accounts payable and bookkeeping apps
- Testing bill payment flows that validate the payee's bank details
- Filling demo and staging accounts with realistic bills
- Checking document parsing and AI extraction pipelines

## Run locally

```sh
npm ci
npm run dev
```

## A note on the code

This project is vibe-coded, so the code is low quality.
