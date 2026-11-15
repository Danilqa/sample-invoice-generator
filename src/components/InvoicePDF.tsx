import { Document, Font, Page, Text as PDFText, View, StyleSheet } from '@react-pdf/renderer';
import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff';
import inter500 from '@fontsource/inter/files/inter-latin-500-normal.woff';
import inter600 from '@fontsource/inter/files/inter-latin-600-normal.woff';
import type { InvoiceData } from '../types/invoice';
import { getCurrencyByCode } from '../utils/currencies';
import { formatAmount } from '@/lib/format';

// Static weights: react-pdf can't pick a weight out of the variable font the app uses
Font.register({
  family: 'Inter',
  fonts: [
    { src: inter400, fontWeight: 400 },
    { src: inter500, fontWeight: 500 },
    { src: inter600, fontWeight: 600 },
  ],
});
// Keep names, emails and IBANs whole instead of hyphenating them across lines
Font.registerHyphenationCallback((word) => [word]);

const INK = '#0a0a0a';
const MUTED = '#737373';
const HAIRLINE = '#e5e5e5';
const VAT_RATE = 0.2;

const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 9,
    lineHeight: 1.45,
    color: INK,
    paddingTop: 52,
    paddingHorizontal: 52,
    paddingBottom: 72,
  },
  row: { flexDirection: 'row' },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  companyName: { fontWeight: 600 },
  muted: { color: MUTED },
  amountLabel: { marginTop: 48, color: MUTED },
  amountDue: { fontSize: 44, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1.1 },
  dueDate: { marginTop: 4, color: MUTED },
  parties: {
    flexDirection: 'row',
    marginTop: 36,
    paddingTop: 18,
    borderTopWidth: 0.5,
    borderTopColor: HAIRLINE,
  },
  party: { flex: 1, paddingRight: 16 },
  dates: { width: 110 },
  label: { color: MUTED, marginBottom: 4 },
  secondLabel: { color: MUTED, marginTop: 8, marginBottom: 4 },
  items: { marginTop: 32 },
  itemsHeader: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: HAIRLINE, color: MUTED },
  itemRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: HAIRLINE },
  description: { flex: 1, paddingRight: 12 },
  quantity: { width: 50, textAlign: 'right' },
  price: { width: 80, textAlign: 'right' },
  totals: { marginLeft: '55%', marginTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, color: MUTED },
  grandTotal: { fontWeight: 600 },
  payment: { marginTop: 32, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16 },
  paymentTitle: { fontWeight: 600 },
  paymentFields: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  paymentField: { width: '50%', marginBottom: 8, paddingRight: 12 },
  paymentValue: { fontWeight: 500 },
  disclaimer: { position: 'absolute', bottom: 34, left: 52, right: 52, color: MUTED, fontSize: 8 },
});

// DD/MM/YYYY (the form's format) → 30 November 2026; anything else is printed as typed
const toLongDate = (value: string) => {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return value;
  const [, day, month, year] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

// The account fields each currency is paid by, as on a UK bill
const toPaymentFields = (data: InvoiceData): [string, string][] => {
  const accountFields: [string, string][] =
    data.currency === 'EUR'
      ? [['IBAN', data.iban]]
      : data.currency === 'USD'
        ? [['IBAN', data.iban], ['SWIFT/BIC', data.swiftBic]]
        : [['Sort code', data.sortCode], ['Account number', data.accountNumber]];
  return [['Account name', data.accountName], ...accountFields, ['Reference', data.invoiceNumber]];
};

const Lines = ({ lines }: { lines: string[] }) => (
  <>
    {lines.filter(Boolean).map((line, index) => (
      <PDFText key={index}>{line}</PDFText>
    ))}
  </>
);

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

  const symbol = getCurrencyByCode(data.currency || 'GBP')?.symbol || '£';
  const toMoney = (value: number) => formatAmount(value, symbol);
  const lines = data.items.map((item) => {
    const quantity = item.quantity === '' || item.quantity === 0 ? 1 : item.quantity;
    const unitPrice = item.unitPrice === '' ? 0 : item.unitPrice;
    return { description: item.description, quantity, unitPrice, amount: quantity * unitPrice };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;
  const issueDate = toLongDate(data.issueDate);
  const dueDate = toLongDate(data.dueDate);

  return (
    <Document title={`Invoice ${data.invoiceNumber}`} author={data.companyName}>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <PDFText style={pdfStyles.companyName}>{data.companyName}</PDFText>
          <PDFText style={pdfStyles.muted}>Invoice {data.invoiceNumber}</PDFText>
        </View>

        <PDFText style={pdfStyles.amountLabel}>Amount due</PDFText>
        <PDFText style={pdfStyles.amountDue}>{toMoney(total)}</PDFText>
        <PDFText style={pdfStyles.dueDate}>Due {dueDate}</PDFText>

        <View style={pdfStyles.parties}>
          <View style={pdfStyles.party}>
            <PDFText style={pdfStyles.label}>Billed to</PDFText>
            <Lines lines={[data.clientName, data.clientAddress, data.clientEmail]} />
          </View>
          <View style={pdfStyles.party}>
            <PDFText style={pdfStyles.label}>From</PDFText>
            <Lines
              lines={[
                data.companyName,
                data.companyAddress,
                data.companyEmail,
                data.companyPhone,
                data.companyVatNumber && `VAT ${data.companyVatNumber}`,
              ]}
            />
          </View>
          <View style={pdfStyles.dates}>
            <PDFText style={pdfStyles.label}>Issued</PDFText>
            <PDFText>{issueDate}</PDFText>
            <PDFText style={pdfStyles.secondLabel}>Due</PDFText>
            <PDFText>{dueDate}</PDFText>
          </View>
        </View>

        <View style={pdfStyles.items}>
          <View style={pdfStyles.itemsHeader}>
            <PDFText style={pdfStyles.description}>Description</PDFText>
            <PDFText style={pdfStyles.quantity}>Qty</PDFText>
            <PDFText style={pdfStyles.price}>Price</PDFText>
            <PDFText style={pdfStyles.price}>Amount</PDFText>
          </View>
          {lines.map((line, index) => (
            <View key={index} style={pdfStyles.itemRow} wrap={false}>
              <PDFText style={pdfStyles.description}>{line.description}</PDFText>
              <PDFText style={pdfStyles.quantity}>{line.quantity}</PDFText>
              <PDFText style={pdfStyles.price}>{toMoney(line.unitPrice)}</PDFText>
              <PDFText style={pdfStyles.price}>{toMoney(line.amount)}</PDFText>
            </View>
          ))}
        </View>

        <View style={pdfStyles.totals} wrap={false}>
          <View style={pdfStyles.subtotalRow}>
            <PDFText>Subtotal</PDFText>
            <PDFText>{toMoney(subtotal)}</PDFText>
          </View>
          <View style={pdfStyles.subtotalRow}>
            <PDFText>VAT (20%)</PDFText>
            <PDFText>{toMoney(vat)}</PDFText>
          </View>
          <View style={[pdfStyles.totalRow, pdfStyles.grandTotal]}>
            <PDFText>Total</PDFText>
            <PDFText>{toMoney(total)}</PDFText>
          </View>
        </View>

        <View style={pdfStyles.payment} wrap={false}>
          <PDFText style={pdfStyles.paymentTitle}>Pay by bank transfer</PDFText>
          <View style={pdfStyles.paymentFields}>
            {toPaymentFields(data).map(([label, value]) => (
              <View key={label} style={pdfStyles.paymentField}>
                <PDFText style={pdfStyles.muted}>{label}</PDFText>
                <PDFText style={pdfStyles.paymentValue}>{value}</PDFText>
              </View>
            ))}
          </View>
        </View>

        <PDFText style={pdfStyles.disclaimer} fixed>
          This is not a real invoice. Don't pay!
        </PDFText>
      </Page>
    </Document>
  );
};
