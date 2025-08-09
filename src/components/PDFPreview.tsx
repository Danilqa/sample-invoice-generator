import { Card } from '@radix-ui/themes';
import { PDFViewer } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';
import type { InvoiceData } from '../types/invoice';

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
    <Card style={{ flex: 1, padding: '20px' }}>
      <div style={{ height: '100%', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
        {pdfBlob && (
          <PDFViewer 
            key={pdfKey}
            style={{ width: '100%', height: '100%' }}
          >
            <InvoicePDF data={invoiceData} />
          </PDFViewer>
        )}
      </div>
    </Card>
  );
};
