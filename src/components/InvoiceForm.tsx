import { Flex, Card, Text, Button, TextField, Separator, Grid, Box, Select } from '@radix-ui/themes';
import { useState, useEffect } from 'react';
import type { InvoiceData, InvoiceItem } from '../types/invoice';
import { charityBankDetails, generateRandomInvalidBankDetails } from '../utils/bankDetails';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onGenerate: () => void;
  onDownload: () => void;
  pdfBlob: Blob | null;
  onUpdateItems?: (items: InvoiceItem[]) => void;
  onUpdateBankDetails?: (sortCode: string, accountNumber: string, accountName: string) => void;
}

export const InvoiceForm = ({ invoiceData, onGenerate, onDownload, pdfBlob, onUpdateItems, onUpdateBankDetails }: InvoiceFormProps) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedBankDetails, setSelectedBankDetails] = useState<string>('');

  useEffect(() => {
    // Take only the first 2 items from the invoice data
    const firstTwoItems = invoiceData.items.slice(0, 2);
    // If there are fewer than 2 items, create empty ones
    while (firstTwoItems.length < 2) {
      firstTwoItems.push({
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      });
    }
    setItems(firstTwoItems);
  }, [invoiceData.items]);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? Number(value) : newItems[index].unitPrice;
      newItems[index].total = quantity * unitPrice;
    }

    setItems(newItems);
    onUpdateItems?.(newItems);
  };

  const handleBankDetailsChange = (value: string) => {
    setSelectedBankDetails(value);

    if (value === 'random') {
      const randomDetails = generateRandomInvalidBankDetails();
      onUpdateBankDetails?.(randomDetails.sortCode, randomDetails.accountNumber, randomDetails.name);
    } else {
      const selectedDetails = charityBankDetails.find(bank => bank.name === value);
      if (selectedDetails) {
        onUpdateBankDetails?.(selectedDetails.sortCode, selectedDetails.accountNumber, selectedDetails.name);
      }
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
      <Flex direction="column" gap="4">
        <Button size="3" onClick={onGenerate}>
          Regenerate data
        </Button>

        <Button size="3" onClick={onDownload} disabled={!pdfBlob}>
          Download PDF
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

        <Separator />

        <Text size="4" weight="bold">Bank Details</Text>
        <Box>
          <Flex direction="column" gap="2">
              <Text as="label" htmlFor="bankDetails" size="2" weight="bold">Select Bank Details</Text>
              <Select.Root value={selectedBankDetails} onValueChange={handleBankDetailsChange}>
                <Select.Trigger placeholder="Choose bank details..." />
                <Select.Content>
                  {charityBankDetails.map((bank) => (
                    <Select.Item key={bank.name} value={bank.name}>
                      {bank.name} - {bank.sortCode} / {bank.accountNumber}
                    </Select.Item>
                  ))}
                  <Select.Item value="random">Generate random invalid</Select.Item>
                </Select.Content>
              </Select.Root>
              <Text size="1" color="gray">
                  Real charity bank details from public sources.
              </Text>
          </Flex>
        </Box>

        <Grid columns="3" gap="3">
          <Box>
            <Text as="label" htmlFor="sortCode" size="2" weight="bold">Sort Code</Text>
            <TextField.Root id="sortCode" value={invoiceData.sortCode} readOnly />
          </Box>
          <Box>
            <Text as="label" htmlFor="accountNumber" size="2" weight="bold">Account Number</Text>
            <TextField.Root id="accountNumber" value={invoiceData.accountNumber} readOnly />
          </Box>
          <Box>
            <Text as="label" htmlFor="accountName" size="2" weight="bold">Account Name</Text>
            <TextField.Root id="accountName" value={invoiceData.accountName} readOnly />
          </Box>
        </Grid>

        <Separator />

        <Text size="4" weight="bold">Invoice Items</Text>
        {items.map((item, index) => (
          <InvoiceItemCard
            key={index}
            item={item}
            onUpdate={(field, value) => updateItem(index, field, value)}
          />
        ))}

        <Separator />

        <Text size="4" weight="bold">
          Total: £{(totalAmount * 1.2).toFixed(2)} (inc. VAT)
        </Text>
      </Flex>
    </Card>
  );
};

interface InvoiceItemCardProps {
  item: InvoiceItem;
  onUpdate: (field: keyof InvoiceItem, value: string | number) => void;
}

const InvoiceItemCard = ({ item, onUpdate }: InvoiceItemCardProps) => (
  <Card style={{ padding: '10px' }}>
    <Grid columns="4" gap="2">
      <Box>
        <Text size="2" weight="bold">Description</Text>
        <TextField.Root
          size="1"
          value={item.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Enter description"
        />
      </Box>
      <Box>
        <Text size="2" weight="bold">Qty</Text>
        <TextField.Root
          size="1"
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdate('quantity', Number(e.target.value))}
          min="1"
        />
      </Box>
      <Box>
        <Text size="2" weight="bold">Unit Price</Text>
        <TextField.Root
          size="1"
          type="number"
          value={item.unitPrice}
          onChange={(e) => onUpdate('unitPrice', Number(e.target.value))}
          min="0"
          step="0.01"
        />
      </Box>
      <Box>
        <Text size="2" weight="bold">Total</Text>
        <Text size="2">£{item.total.toFixed(2)}</Text>
      </Box>
    </Grid>
  </Card>
);
