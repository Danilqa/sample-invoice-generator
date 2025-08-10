export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyVatNumber: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  sortCode: string;
  accountNumber: string;
  accountName: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number | '';
  unitPrice: number | '';
  total: number;
}
