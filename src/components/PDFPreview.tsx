import { Card, Text } from '@radix-ui/themes';
import { PDFViewer } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';
import type { InvoiceData } from '../types/invoice';

interface PDFPreviewProps {
  invoiceData: InvoiceData;
  pdfBlob: Blob | null;
}

export const PDFPreview = ({ invoiceData, pdfBlob }: PDFPreviewProps) => {
  return (
    <Card style={{ flex: 1, padding: '20px' }}>
      <Text size="4" weight="bold" style={{ marginBottom: '10px' }}>PDF Preview</Text>
      <div style={{ height: 'calc(100% - 40px)', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
        {pdfBlob && (
          <PDFViewer style={{ width: '100%', height: '100%' }}>
            <InvoicePDF data={invoiceData} />
          </PDFViewer>
        )}
      </div>
    </Card>
  );
};
