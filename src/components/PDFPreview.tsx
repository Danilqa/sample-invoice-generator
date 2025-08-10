import { Card } from '@radix-ui/themes';
import { PDFViewer } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';
import type { InvoiceData } from '../types/invoice';
import './PDFPreview.css';

interface PDFPreviewProps {
  invoiceData: InvoiceData;
  pdfBlob: Blob | null;
}

export const PDFPreview = ({ invoiceData, pdfBlob }: PDFPreviewProps) => {
  // Create a unique key that changes whenever any relevant data changes
  const pdfKey = JSON.stringify({
    invoiceNumber: invoiceData.invoiceNumber,
    sortCode: invoiceData.sortCode,
    accountNumber: invoiceData.accountNumber,
    accountName: invoiceData.accountName,
    companyName: invoiceData.companyName,
    clientName: invoiceData.clientName,
    items: invoiceData.items
  });

  return (
    <Card className="pdf-preview-card">
      <div className="pdf-preview-container">
        {pdfBlob && (
          <PDFViewer 
            key={pdfKey}
            className="pdf-viewer"
          >
            <InvoicePDF data={invoiceData} />
          </PDFViewer>
        )}
      </div>
    </Card>
  );
};
