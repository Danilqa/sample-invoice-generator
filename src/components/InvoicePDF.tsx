import { Document, Page, Text as PDFText, View, StyleSheet } from '@react-pdf/renderer';
import { InvoiceData } from '../types/invoice';

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  invoiceInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#374151',
  },
  text: {
    marginBottom: 3,
    color: '#4b5563',
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  headerRow: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  col1: { width: '40%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'center' },
  col4: { width: '20%', textAlign: 'right' },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 10,
    fontWeight: 'bold',
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
    color: '#6b7280',
  },
});

interface InvoicePDFProps {
  data: InvoiceData;
}

export const InvoicePDF = ({ data }: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <View style={pdfStyles.companyInfo}>
          <PDFText style={pdfStyles.title}>{data.companyName}</PDFText>
          <PDFText style={pdfStyles.text}>{data.companyAddress}</PDFText>
          <PDFText style={pdfStyles.text}>Phone: {data.companyPhone}</PDFText>
          <PDFText style={pdfStyles.text}>Email: {data.companyEmail}</PDFText>
          <PDFText style={pdfStyles.text}>VAT Number: {data.companyVatNumber}</PDFText>
        </View>
        <View style={pdfStyles.invoiceInfo}>
          <PDFText style={pdfStyles.subtitle}>INVOICE</PDFText>
          <PDFText style={pdfStyles.text}>Invoice #: {data.invoiceNumber}</PDFText>
          <PDFText style={pdfStyles.text}>Issue Date: {data.issueDate}</PDFText>
          <PDFText style={pdfStyles.text}>Due Date: {data.dueDate}</PDFText>
        </View>
      </View>

      {/* Client Information */}
      <View style={pdfStyles.section}>
        <PDFText style={pdfStyles.subtitle}>Bill To:</PDFText>
        <PDFText style={pdfStyles.text}>{data.clientName}</PDFText>
        <PDFText style={pdfStyles.text}>{data.clientAddress}</PDFText>
        <PDFText style={pdfStyles.text}>{data.clientEmail}</PDFText>
      </View>

      <View style={{ marginVertical: 20, height: 1, backgroundColor: '#e5e7eb' }} />

      {/* Items Table */}
      <View style={pdfStyles.section}>
        <View style={[pdfStyles.row, pdfStyles.headerRow]}>
          <PDFText style={pdfStyles.col1}>Description</PDFText>
          <PDFText style={pdfStyles.col2}>Quantity</PDFText>
          <PDFText style={pdfStyles.col3}>Unit Price</PDFText>
          <PDFText style={pdfStyles.col4}>Total</PDFText>
        </View>
        {data.items.map((item, index) => (
          <View key={index} style={pdfStyles.row}>
            <PDFText style={pdfStyles.col1}>{item.description}</PDFText>
            <PDFText style={pdfStyles.col2}>{item.quantity}</PDFText>
            <PDFText style={pdfStyles.col3}>£{item.unitPrice.toFixed(2)}</PDFText>
            <PDFText style={pdfStyles.col4}>£{item.total.toFixed(2)}</PDFText>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={pdfStyles.totalSection}>
        <View style={pdfStyles.totalRow}>
          <PDFText style={pdfStyles.totalLabel}>Subtotal:</PDFText>
          <PDFText style={pdfStyles.totalValue}>
            £{data.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
          </PDFText>
        </View>
        <View style={pdfStyles.totalRow}>
          <PDFText style={pdfStyles.totalLabel}>VAT (20%):</PDFText>
          <PDFText style={pdfStyles.totalValue}>
            £{(data.items.reduce((sum, item) => sum + item.total, 0) * 0.2).toFixed(2)}
          </PDFText>
        </View>
        <View style={pdfStyles.totalRow}>
          <PDFText style={pdfStyles.totalLabel}>Total:</PDFText>
          <PDFText style={pdfStyles.totalValue}>
            £{(data.items.reduce((sum, item) => sum + item.total, 0) * 1.2).toFixed(2)}
          </PDFText>
        </View>
      </View>

      {/* Footer */}
      <View style={pdfStyles.footer}>
        <PDFText>Thank you for your business!</PDFText>
        <PDFText>Payment is due within 30 days of invoice date.</PDFText>
      </View>
    </Page>
  </Document>
);
