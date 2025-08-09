# Utils

This directory contains utility functions for the invoice generator application.

## Utility Functions

### `invoiceGenerator.ts`
- **Purpose**: Generates fake invoice data for testing and demonstration
- **Exports**:
  - `generateFakeInvoice()`: Creates a complete fake invoice with random data
- **Features**:
  - Uses Faker.js to generate realistic fake data
  - Creates random invoice items with quantities and prices
  - Generates UK-style VAT numbers and addresses

### `pdfUtils.tsx`
- **Purpose**: Handles PDF generation and download operations
- **Exports**:
  - `generatePDFBlob(invoiceData)`: Converts invoice data to PDF blob
  - `downloadPDF(pdfBlob, invoiceNumber)`: Downloads the PDF with proper filename
- **Features**:
  - Abstracts PDF generation logic
  - Handles file download with proper cleanup
  - Uses react-pdf for PDF generation

## Usage

```tsx
import { generateFakeInvoice, generatePDFBlob, downloadPDF } from './utils';

// Generate new invoice data
const newInvoice = generateFakeInvoice();

// Generate PDF blob
const pdfBlob = await generatePDFBlob(invoiceData);

// Download PDF
downloadPDF(pdfBlob, invoiceData.invoiceNumber);
```
