import { Flex, Card, Text, Button, TextField, Separator, Grid, Box } from '@radix-ui/themes';
import type { InvoiceData, InvoiceItem } from '../types/invoice';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onGenerate: () => void;
  onDownload: () => void;
  pdfBlob: Blob | null;
}

export const InvoiceForm = ({ invoiceData, onGenerate, onDownload, pdfBlob }: InvoiceFormProps) => {
  return (
    <Card style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
      <Flex direction="column" gap="4">
        <Text size="6" weight="bold">UK Invoice Generator</Text>
        
        <Button size="3" onClick={onGenerate}>
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
          <InvoiceItemCard key={index} item={item} />
        ))}

        <Separator />

        <Flex justify="between" align="center">
          <Text size="4" weight="bold">
            Total: £{(invoiceData.items.reduce((sum, item) => sum + item.total, 0) * 1.2).toFixed(2)} (inc. VAT)
          </Text>
          <Button size="3" onClick={onDownload} disabled={!pdfBlob}>
            Download PDF
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

interface InvoiceItemCardProps {
  item: InvoiceItem;
}

const InvoiceItemCard = ({ item }: InvoiceItemCardProps) => (
  <Card style={{ padding: '10px' }}>
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
);
