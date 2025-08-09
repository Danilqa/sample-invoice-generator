# UK Invoice Generator

THE PROJECT IS VIBE-CODED. THE CODE IS LOW-QUALITY.

## Features

- **UK Invoice Format**: Generates invoices compliant with UK business standards
- **PDF Generation**: Creates downloadable PDF invoices using @react-pdf/renderer
- **Auto-populated Data**: Uses Faker.js to generate realistic sample data
- **Modern UI**: Built with Radix UI components for a clean, accessible interface
- **Real-time Preview**: Live PDF preview updates as you generate new invoices
- **VAT Calculation**: Automatically calculates 20% VAT on all invoices

## Technology Stack

- **React 19** with TypeScript
- **Radix UI** for UI components and theming
- **@react-pdf/renderer** for PDF generation
- **Faker.js** for generating sample data
- **Vite** for build tooling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sample-invoice-generator
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Generate Invoice**: Click the "Generate New Invoice" button to create a new invoice with random data
2. **Preview PDF**: The right panel shows a live preview of the generated PDF
3. **Download PDF**: Click the "Download PDF" button to save the invoice as a PDF file

## Invoice Structure

Each generated invoice includes:

- **Company Information**: Name, address, phone, email, and VAT number
- **Client Information**: Name, address, and email
- **Invoice Details**: Invoice number, issue date, and due date
- **Line Items**: Product descriptions, quantities, unit prices, and totals
- **Financial Summary**: Subtotal, VAT (20%), and total amount
- **Payment Terms**: Standard 30-day payment terms

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

### Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Application styles
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

## Customization

The application can be easily customized by modifying:

- **PDF Styling**: Update the `pdfStyles` object in `App.tsx`
- **Invoice Fields**: Modify the `InvoiceData` interface and form components
- **Data Generation**: Adjust the `generateFakeInvoice` function for different data patterns
- **UI Layout**: Customize the Radix UI components and layout structure

## License

This project is open source and available under the MIT License.
