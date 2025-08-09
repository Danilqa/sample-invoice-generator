# Components

This directory contains the decomposed components of the invoice generator application.

## Component Structure

### `InvoiceForm.tsx`
- **Purpose**: Displays the invoice form with all invoice data fields
- **Props**: 
  - `invoiceData`: The current invoice data
  - `onGenerate`: Callback to generate a new invoice
  - `onDownload`: Callback to download the PDF
  - `pdfBlob`: The current PDF blob for download state
- **Features**: 
  - Displays all invoice fields in a read-only format
  - Shows invoice items in a card layout
  - Contains the generate and download buttons
  - Calculates and displays the total with VAT

### `PDFPreview.tsx`
- **Purpose**: Renders the PDF preview using react-pdf
- **Props**:
  - `invoiceData`: The current invoice data
  - `pdfBlob`: The current PDF blob for preview state
- **Features**:
  - Displays the PDF preview in a viewer
  - Only shows when PDF blob is available

### `InvoicePDF.tsx`
- **Purpose**: Defines the PDF document structure and styling
- **Props**:
  - `data`: The invoice data to render
- **Features**:
  - Contains all PDF styles and layout
  - Renders the complete invoice document
  - Handles all PDF-specific formatting

### `InvoiceItemCard.tsx` (Internal component)
- **Purpose**: Renders individual invoice items in the form
- **Props**:
  - `item`: The invoice item data
- **Features**:
  - Displays item description, quantity, unit price, and total
  - Used within the InvoiceForm component

## Usage

```tsx
import { InvoiceForm, PDFPreview } from './components';

// In your main component
<InvoiceForm 
  invoiceData={invoiceData}
  onGenerate={handleGenerate}
  onDownload={handleDownload}
  pdfBlob={pdfBlob}
/>
<PDFPreview 
  invoiceData={invoiceData}
  pdfBlob={pdfBlob}
/>
```
