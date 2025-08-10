import { Document, Page, Text as PDFText, View, StyleSheet } from '@react-pdf/renderer';
import type { InvoiceData } from '../types/invoice';
import { getCurrencyByCode } from '../utils/currencies';

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
  // Standard UK Bill Bank Details Section
  bankDetailsSection: {
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 15,
    backgroundColor: '#ffffff',
  },
  bankDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
    textAlign: 'left',
  },
  bankDetailsRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bankDetailsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    width: '25%',
  },
  bankDetailsValue: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#000000',
    width: '75%',
    fontFamily: 'Helvetica',
  },
  bankDetailsBox: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 8,
    marginTop: 10,
    backgroundColor: '#f9f9f9',
  },
  bankDetailsBoxTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  bankDetailsBoxText: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 2,
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

export const InvoicePDF = ({ data }: InvoicePDFProps) => {
  // Safety check to ensure data is properly initialized
  if (!data || !data.items) {
    return (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <PDFText>Loading...</PDFText>
        </Page>
      </Document>
    );
  }

  return (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <View style={pdfStyles.companyInfo}>
          <PDFText style={pdfStyles.title}>{data.companyName}</PDFText>
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
        {data.items.map((item, index) => {
          const currency = getCurrencyByCode(data.currency || 'GBP');
          const symbol = currency?.symbol || '£';
          return (
            <View key={index} style={pdfStyles.row}>
              <PDFText style={pdfStyles.col1}>{item.description}</PDFText>
              <PDFText style={pdfStyles.col2}>{item.quantity === '' || item.quantity === 0 ? 1 : item.quantity}</PDFText>
              <PDFText style={pdfStyles.col3}>{symbol}{(item.unitPrice === '' || item.unitPrice === 0 ? 0 : item.unitPrice).toFixed(2)}</PDFText>
              <PDFText style={pdfStyles.col4}>{symbol}{item.total.toFixed(2)}</PDFText>
            </View>
          );
        })}
      </View>

      {/* Totals */}
      <View style={pdfStyles.totalSection}>
        {(() => {
          const currency = getCurrencyByCode(data.currency || 'GBP');
          const symbol = currency?.symbol || '£';
          const subtotal = data.items.reduce((sum, item) => {
            const quantity = item.quantity === '' || item.quantity === 0 ? 1 : item.quantity;
            const unitPrice = item.unitPrice === '' || item.unitPrice === 0 ? 0 : item.unitPrice;
            return sum + (quantity * unitPrice);
          }, 0);
          const vat = subtotal * 0.2;
          const total = subtotal + vat;
          
          return (
            <>
              <View style={pdfStyles.totalRow}>
                <PDFText style={pdfStyles.totalLabel}>Subtotal:</PDFText>
                <PDFText style={pdfStyles.totalValue}>
                  {symbol}{subtotal.toFixed(2)}
                </PDFText>
              </View>
              <View style={pdfStyles.totalRow}>
                <PDFText style={pdfStyles.totalLabel}>VAT (20%):</PDFText>
                <PDFText style={pdfStyles.totalValue}>
                  {symbol}{vat.toFixed(2)}
                </PDFText>
              </View>
              <View style={pdfStyles.totalRow}>
                <PDFText style={pdfStyles.totalLabel}>Total:</PDFText>
                <PDFText style={pdfStyles.totalValue}>
                  {symbol}{total.toFixed(2)}
                </PDFText>
              </View>
            </>
          );
        })()}
      </View>

      {/* Standard UK Bill Bank Details Section */}
      <View style={pdfStyles.bankDetailsSection}>
        <PDFText style={pdfStyles.bankDetailsTitle}>BANK DETAILS</PDFText>
        <View style={pdfStyles.bankDetailsRow}>
          <PDFText style={pdfStyles.bankDetailsLabel}>Account Name:</PDFText>
          <PDFText style={pdfStyles.bankDetailsValue}>{data.accountName || ''}</PDFText>
        </View>
        {(() => {
          const currency = data.currency || 'GBP';
          switch (currency) {
            case 'EUR':
              return (
                <View style={pdfStyles.bankDetailsRow}>
                  <PDFText style={pdfStyles.bankDetailsLabel}>IBAN:</PDFText>
                  <PDFText style={pdfStyles.bankDetailsValue}>{data.iban || ''}</PDFText>
                </View>
              );
            case 'GBP':
            default:
              return (
                <>
                  <View style={pdfStyles.bankDetailsRow}>
                    <PDFText style={pdfStyles.bankDetailsLabel}>Sort Code:</PDFText>
                    <PDFText style={pdfStyles.bankDetailsValue}>{data.sortCode || ''}</PDFText>
                  </View>
                  <View style={pdfStyles.bankDetailsRow}>
                    <PDFText style={pdfStyles.bankDetailsLabel}>Account Number:</PDFText>
                    <PDFText style={pdfStyles.bankDetailsValue}>{data.accountNumber || ''}</PDFText>
                  </View>
                </>
              );
          }
        })()}
        <View style={pdfStyles.bankDetailsRow}>
          <PDFText style={pdfStyles.bankDetailsLabel}>Reference:</PDFText>
          <PDFText style={pdfStyles.bankDetailsValue}>{data.invoiceNumber}</PDFText>
        </View>
        
        <View style={pdfStyles.bankDetailsBox}>
          <PDFText style={pdfStyles.bankDetailsBoxTitle}>IMPORTANT - Please quote your reference number when making payment</PDFText>
          <PDFText style={pdfStyles.bankDetailsBoxText}>• Use your invoice number as the payment reference</PDFText>
          <PDFText style={pdfStyles.bankDetailsBoxText}>• Payment should be made within 30 days</PDFText>
          <PDFText style={pdfStyles.bankDetailsBoxText}>• Bank transfers may take 2-3 working days to clear</PDFText>
        </View>
      </View>

      {/* Footer */}
      <View style={pdfStyles.footer}>
        <PDFText>This is not a real invoice. Don't pay!</PDFText>
      </View>
    </Page>
  </Document>
  );
};
