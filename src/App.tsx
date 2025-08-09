import { useState } from 'react';
import { Theme, Container, Flex, Card, Text, Button, TextField, Separator, Grid, Box } from '@radix-ui/themes';
import { PDFViewer, Document, Page, Text as PDFText, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { faker } from '@faker-js/faker';
import './App.css';

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

// Invoice Data Interface
interface InvoiceData {
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
  items: InvoiceItem[];
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// PDF Document Component
const InvoicePDF = ({ data }: { data: InvoiceData }) => (
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

// Generate fake invoice data
const generateFakeInvoice = (): InvoiceData => {
  const items = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const unitPrice = faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
    return {
      description: faker.commerce.productName(),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };
  });

  return {
    invoiceNumber: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
    issueDate: faker.date.recent({ days: 30 }).toLocaleDateString('en-GB'),
    dueDate: faker.date.soon({ days: 30 }).toLocaleDateString('en-GB'),
    companyName: faker.company.name(),
    companyAddress: faker.location.streetAddress(true),
    companyPhone: faker.phone.number(),
    companyEmail: faker.internet.email(),
    companyVatNumber: `GB${faker.number.int({ min: 100000000, max: 999999999 })}`,
    clientName: faker.person.fullName(),
    clientAddress: faker.location.streetAddress(true),
    clientEmail: faker.internet.email(),
    items,
  };
};

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(generateFakeInvoice());
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleGenerate = async () => {
    const newData = generateFakeInvoice();
    setInvoiceData(newData);
    
    // Generate PDF blob
    const blob = await pdf(<InvoicePDF data={newData} />).toBlob();
    setPdfBlob(blob);
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Theme>
      <Container size="4" style={{ height: '100vh', padding: '20px' }}>
        <Flex direction="row" gap="4" style={{ height: '100%' }}>
          {/* Left Panel - Form */}
          <Card style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
            <Flex direction="column" gap="4">
              <Text size="6" weight="bold">UK Invoice Generator</Text>
              
              <Button size="3" onClick={handleGenerate}>
                Generate New Invoice
              </Button>

              <Separator />

              <Grid columns="2" gap="3">
                <Box>
                  <Text as="label" htmlFor="invoiceNumber" size="2" weight="bold">Invoice Number</Text>
                  <TextField.Root id="invoiceNumber" value={invoiceData.invoiceNumber} readOnly />
                </Box>
                <Box>
                  <Text as="label" htmlFor="issueDate" size="2" weight="bold">Issue Date</Text>
                  <TextField.Root id="issueDate" value={invoiceData.issueDate} readOnly />
                </Box>
                <Box>
                  <Text as="label" htmlFor="dueDate" size="2" weight="bold">Due Date</Text>
                  <TextField.Root id="dueDate" value={invoiceData.dueDate} readOnly />
                </Box>
                <Box>
                  <Text as="label" htmlFor="companyName" size="2" weight="bold">Company Name</Text>
                  <TextField.Root id="companyName" value={invoiceData.companyName} readOnly />
                </Box>
              </Grid>

              <Box>
                <Text as="label" htmlFor="companyAddress" size="2" weight="bold">Company Address</Text>
                <TextField.Root id="companyAddress" value={invoiceData.companyAddress} readOnly />
              </Box>

              <Grid columns="2" gap="3">
                <Box>
                  <Text as="label" htmlFor="companyPhone" size="2" weight="bold">Phone</Text>
                  <TextField.Root id="companyPhone" value={invoiceData.companyPhone} readOnly />
                </Box>
                <Box>
                  <Text as="label" htmlFor="companyEmail" size="2" weight="bold">Email</Text>
                  <TextField.Root id="companyEmail" value={invoiceData.companyEmail} readOnly />
                </Box>
              </Grid>

              <Box>
                <Text as="label" htmlFor="vatNumber" size="2" weight="bold">VAT Number</Text>
                <TextField.Root id="vatNumber" value={invoiceData.companyVatNumber} readOnly />
              </Box>

              <Separator />

              <Box>
                <Text as="label" htmlFor="clientName" size="2" weight="bold">Client Name</Text>
                <TextField.Root id="clientName" value={invoiceData.clientName} readOnly />
              </Box>

              <Box>
                <Text as="label" htmlFor="clientAddress" size="2" weight="bold">Client Address</Text>
                <TextField.Root id="clientAddress" value={invoiceData.clientAddress} readOnly />
              </Box>

              <Box>
                <Text as="label" htmlFor="clientEmail" size="2" weight="bold">Client Email</Text>
                <TextField.Root id="clientEmail" value={invoiceData.clientEmail} readOnly />
              </Box>

              <Separator />

              <Text size="4" weight="bold">Invoice Items</Text>
              {invoiceData.items.map((item, index) => (
                <Card key={index} style={{ padding: '10px' }}>
                  <Grid columns="4" gap="2">
                    <Box>
                      <Text size="2" weight="bold">Description</Text>
                      <Text size="2">{item.description}</Text>
                    </Box>
                    <Box>
                      <Text size="2" weight="bold">Qty</Text>
                      <Text size="2">{item.quantity}</Text>
                    </Box>
                    <Box>
                      <Text size="2" weight="bold">Unit Price</Text>
                      <Text size="2">£{item.unitPrice.toFixed(2)}</Text>
                    </Box>
                    <Box>
                      <Text size="2" weight="bold">Total</Text>
                      <Text size="2">£{item.total.toFixed(2)}</Text>
                    </Box>
                  </Grid>
                </Card>
              ))}

              <Separator />

              <Flex justify="between" align="center">
                <Text size="4" weight="bold">
                  Total: £{(invoiceData.items.reduce((sum, item) => sum + item.total, 0) * 1.2).toFixed(2)} (inc. VAT)
                </Text>
                <Button size="3" onClick={handleDownload} disabled={!pdfBlob}>
                  Download PDF
                </Button>
              </Flex>
            </Flex>
          </Card>

          {/* Right Panel - PDF Preview */}
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
        </Flex>
      </Container>
    </Theme>
  );
}

export default App;
