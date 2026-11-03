# Components

This directory contains the decomposed components of the invoice generator application.
Styling uses Tailwind CSS v4 and [shadcn/ui](https://ui.shadcn.com) primitives from `./ui`; theme tokens and the
short-screen density variables live in `src/index.css`.

## Component Structure

### `InvoiceForm.tsx`
- **Purpose**: The left column: page heading, the editable form and the Regenerate / Download PDF actions
- **Props**:
  - `invoiceData`: The current invoice data
  - `onGenerate`: Called with `true` to regenerate the data while keeping the client and bank details
  - `onDownload`: Downloads the current PDF
  - `pdfBlob`: The current PDF blob; Download is disabled until it exists
  - `onUpdateItems`: Called when a line item changes
  - `onUpdateBankDetails`: Called when bank details are picked or generated
  - `onUpdateField`: Called when a single invoice field changes
  - `header`: Optional content rendered at the top of the column (the app's logo and name)
- **Features**:
  - Invoice, Bank details (currency switch, charity picker, currency-specific fields) and Line items sections
  - Subtotal, VAT and the total incl. VAT, with the same digits as the PDF
  - R and D keyboard shortcuts (ignored while typing)
  - On desktop the form scrolls on its own and the actions sit in a bar pinned below it
  - Rows of fields (GBP and USD bank details, line items) stack when the column is too narrow for their values

### `PDFPreview.tsx`
- **Purpose**: The live PDF preview under a "Preview" tab row
- **Props**:
  - `invoiceData`: The current invoice data
  - `pdfBlob`: The current PDF blob; a placeholder sheet shows until it exists
  - `actions`: Optional extra controls at the right end of the tab row
- **Features**:
  - Shows the PDF as a white sheet and offers to open it in a new tab
  - The sheet gets a focus ring while the viewer has keyboard focus (the arrow keys then scroll the page)
  - On phones the viewer mounts only when the sheet scrolls near the screen

### `InvoicePDF.tsx`
- **Purpose**: Defines the PDF document structure and styling
- **Props**:
  - `data`: The invoice data to render
- **Features**:
  - Contains all PDF styles and layout
  - Renders the complete invoice document
  - Handles all PDF-specific formatting

### `Amount.tsx`
- **Purpose**: A money figure with smaller raised cents, in Mercury's style
- **Props**: `value`, `symbol` and an optional `className`

### `Logo.tsx`
- **Purpose**: The logo mark, a receipt inside a coin with a braided rim (in the spirit of Mercury's woven emblem); follows the text colour, so it works in both themes

### `ThemeMenu.tsx`
- **Purpose**: Icon button with a System / Light / Dark menu
- **Props**: `value`, `onChange` and an optional `className` (state comes from `src/hooks/useTheme.ts`)

### `StarBanner.tsx`
- **Purpose**: The GitHub star banner at the top of the page
- **Props**: `onDismiss`, called when the banner is clicked

### `ui/`
- shadcn/ui components: button, input, label, kbd, select, dropdown menu and toggle group

## Usage

```tsx
import { InvoiceForm, PDFPreview } from './components';

// In your main component
<InvoiceForm
  invoiceData={invoiceData}
  onGenerate={handleGenerate}
  onDownload={handleDownload}
  pdfBlob={pdfBlob}
  onUpdateItems={handleUpdateItems}
  onUpdateBankDetails={handleUpdateBankDetails}
  onUpdateField={handleUpdateField}
/>
<PDFPreview
  invoiceData={invoiceData}
  pdfBlob={pdfBlob}
/>
```
