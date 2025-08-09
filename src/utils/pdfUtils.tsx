import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '../components/InvoicePDF';
import type { InvoiceData } from '../types/invoice';

export const generatePDFBlob = async (invoiceData: InvoiceData): Promise<Blob> => {
  return await pdf(<InvoicePDF data={invoiceData} />).toBlob();
};

export const downloadPDF = (pdfBlob: Blob, invoiceNumber: string) => {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoiceNumber}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};
