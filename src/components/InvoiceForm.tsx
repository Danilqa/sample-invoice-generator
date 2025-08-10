import { Flex, Card, Text, Button, TextField, Separator, Grid, Box, Select } from '@radix-ui/themes';
import { useState, useEffect } from 'react';
import type { InvoiceData, InvoiceItem } from '../types/invoice';
import { getBankDetailsByCurrency, generateRandomInvalidBankDetails } from '../utils/bankDetails';
import { currencies, getCurrencyByCode } from '../utils/currencies';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onGenerate: (preserveBankDetails?: boolean) => void;
  onDownload: () => void;
  pdfBlob: Blob | null;
  onUpdateItems?: (items: InvoiceItem[]) => void;
  onUpdateBankDetails?: (sortCode: string, accountNumber: string, accountName: string, iban?: string) => void;
  onUpdateField?: (field: keyof InvoiceData, value: string) => void;
}

export const InvoiceForm = ({ invoiceData, onGenerate, onDownload, pdfBlob, onUpdateItems, onUpdateBankDetails, onUpdateField }: InvoiceFormProps) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedBankDetails, setSelectedBankDetails] = useState<string>('');
  const [isItemsExpanded, setIsItemsExpanded] = useState<boolean>(false);

  // Helper function to handle currency-specific logic
  const handleCurrencySpecificLogic = (currency: string, callback: (type: 'GBP' | 'EUR') => void) => {
    switch (currency) {
      case 'EUR':
        callback('EUR');
        break;
      case 'GBP':
      default:
        callback('GBP');
        break;
    }
  };

  // Helper function to check if currency is EUR
  const isEURCurrency = (currency: string): boolean => {
    switch (currency) {
      case 'EUR':
        return true;
      case 'GBP':
      default:
        return false;
    }
  };

  // Get bank details based on current currency
  const currentBankDetails = getBankDetailsByCurrency(invoiceData.currency as 'GBP' | 'EUR');
  
  // Set initial selected bank details if not set
  useEffect(() => {
    if (!selectedBankDetails && currentBankDetails.length > 0) {
      setSelectedBankDetails(currentBankDetails[0].name);
    }
  }, [currentBankDetails, selectedBankDetails]);

  // Update bank details when currency changes
  useEffect(() => {
    if (currentBankDetails.length > 0) {
      const firstBank = currentBankDetails[0];
      handleCurrencySpecificLogic(invoiceData.currency, (currencyType) => {
        if (currencyType === 'EUR') {
          onUpdateBankDetails?.('', '', firstBank.name, firstBank.iban || '');
        } else {
          onUpdateBankDetails?.(firstBank.sortCode || '', firstBank.accountNumber || '', firstBank.name);
        }
      });
      setSelectedBankDetails(firstBank.name);
    }
  }, [invoiceData.currency]);

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
    
    // Handle quantity and unitPrice fields specially to allow empty values
    if (field === 'quantity' || field === 'unitPrice') {
      // If the value is empty string, store it as empty string
      if (value === '') {
        newItems[index] = { ...newItems[index], [field]: '' };
      } else {
        // Convert to number for calculations
        const numValue = Number(value);
        newItems[index] = { ...newItems[index], [field]: numValue };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }

    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' 
        ? (value === '' ? 0 : Number(value)) 
        : (newItems[index].quantity === '' ? 0 : Number(newItems[index].quantity));
      const unitPrice = field === 'unitPrice' 
        ? (value === '' ? 0 : Number(value)) 
        : (newItems[index].unitPrice === '' ? 0 : Number(newItems[index].unitPrice));
      newItems[index].total = quantity * unitPrice;
    }

    setItems(newItems);
    onUpdateItems?.(newItems);
  };

  const handleBankDetailsChange = (value: string) => {
    setSelectedBankDetails(value);
    
    if (value === 'random') {
      // Generate random invalid bank details
      const randomDetails = generateRandomInvalidBankDetails(invoiceData.currency as 'GBP' | 'EUR');
      handleCurrencySpecificLogic(invoiceData.currency, (currencyType) => {
        if (currencyType === 'EUR') {
          onUpdateBankDetails?.('', '', randomDetails.name, randomDetails.iban || '');
        } else {
          onUpdateBankDetails?.(randomDetails.sortCode || '', randomDetails.accountNumber || '', randomDetails.name);
        }
      });
      // Update company name to match account name
      onUpdateField?.('companyName', randomDetails.name);
    } else {
      const selectedDetails = currentBankDetails.find(bank => bank.name === value);
      if (selectedDetails) {
        handleCurrencySpecificLogic(invoiceData.currency, (currencyType) => {
          if (currencyType === 'EUR') {
            onUpdateBankDetails?.('', '', selectedDetails.name, selectedDetails.iban || '');
          } else {
            onUpdateBankDetails?.(selectedDetails.sortCode || '', selectedDetails.accountNumber || '', selectedDetails.name);
          }
        });
      }
    }
  };

  const totalAmount = items.reduce((sum, item) => {
    const quantity = item.quantity === '' || item.quantity === 0 ? 1 : item.quantity;
    const unitPrice = item.unitPrice === '' || item.unitPrice === 0 ? 0 : item.unitPrice;
    return sum + (quantity * unitPrice);
  }, 0);

  return (
    <Card style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
      <Flex direction="column" gap="4">
        <Flex direction={{ initial: 'column', sm: 'row' }} gap="3">
          <Button size="3" variant="soft" color="blue" onClick={() => onGenerate(true)}>
            Regenerate data
          </Button>

          <Button size="3" variant="soft" color="pink" onClick={onDownload} disabled={!pdfBlob}>
            Download PDF
          </Button>
        </Flex>

        <Separator />

        <Text size="4" weight="bold">📋 Invoice Details</Text>
        <Grid columns={{ initial: "1", sm: "2" }} gap="3">
          <Box>
            <Text as="label" htmlFor="invoiceNumber" size="2" weight="bold">Invoice Number</Text>
            <TextField.Root 
              id="invoiceNumber" 
              value={invoiceData.invoiceNumber} 
              onChange={(e) => onUpdateField?.('invoiceNumber', e.target.value)}
            />
          </Box>
          <Box>
            <Text as="label" htmlFor="issueDate" size="2" weight="bold">Issue Date</Text>
            <TextField.Root 
              id="issueDate" 
              value={invoiceData.issueDate} 
              onChange={(e) => onUpdateField?.('issueDate', e.target.value)}
            />
          </Box>
          <Box>
            <Text as="label" htmlFor="dueDate" size="2" weight="bold">Due Date</Text>
            <TextField.Root 
              id="dueDate" 
              value={invoiceData.dueDate} 
              onChange={(e) => onUpdateField?.('dueDate', e.target.value)}
            />
          </Box>
          <Box>
            <Text as="label" htmlFor="companyName" size="2" weight="bold">Company Name</Text>
            <TextField.Root 
              id="companyName" 
              value={invoiceData.companyName} 
              onChange={(e) => onUpdateField?.('companyName', e.target.value)}
            />
          </Box>
        </Grid>

        <Separator />

        <Text size="4" weight="bold">💱 Currency</Text>
        <Box>
          <Flex direction="column" gap="2">
            <Text as="label" htmlFor="currency" size="2" weight="bold">Select Currency</Text>
            <Select.Root 
              value={invoiceData.currency} 
              onValueChange={(value) => onUpdateField?.('currency', value)}
            >
              <Select.Trigger placeholder="Choose currency..." />
              <Select.Content>
                {currencies.map((currency) => (
                  <Select.Item key={currency.code} value={currency.code}>
                    {currency.flag} {currency.name} ({currency.symbol})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
        </Box>

        <Separator />

        <Text size="4" weight="bold">🏦 Bank Details</Text>
        <Box>
          <Flex direction="column" gap="2">
              <Text as="label" htmlFor="bankDetails" size="2" weight="bold">Select Bank Details</Text>
              <Select.Root value={selectedBankDetails} onValueChange={handleBankDetailsChange}>
                <Select.Trigger placeholder="Choose bank details..." />
                <Select.Content>
                  {currentBankDetails.map((bank) => (
                    <Select.Item key={bank.name} value={bank.name}>
                      {bank.name} - {bank.currency === 'EUR' ? bank.iban : `${bank.sortCode} / ${bank.accountNumber}`}
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

        {isEURCurrency(invoiceData.currency) ? (
          <Grid columns={{ initial: "1", sm: "2" }} gap="3">
            <Box>
              <Text as="label" htmlFor="iban" size="2" weight="bold">IBAN</Text>
              <TextField.Root 
                id="iban" 
                value={invoiceData.iban} 
                onChange={(e) => onUpdateField?.('iban', e.target.value)}
              />
            </Box>
            <Box>
              <Text as="label" htmlFor="accountName" size="2" weight="bold">Account Name</Text>
              <TextField.Root 
                id="accountName" 
                value={invoiceData.accountName} 
                onChange={(e) => onUpdateField?.('accountName', e.target.value)}
              />
            </Box>
          </Grid>
        ) : (
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="3">
            <Box>
              <Text as="label" htmlFor="sortCode" size="2" weight="bold">Sort Code</Text>
              <TextField.Root 
                id="sortCode" 
                value={invoiceData.sortCode} 
                onChange={(e) => onUpdateField?.('sortCode', e.target.value)}
              />
            </Box>
            <Box>
              <Text as="label" htmlFor="accountNumber" size="2" weight="bold">Account Number</Text>
              <TextField.Root 
                id="accountNumber" 
                value={invoiceData.accountNumber} 
                onChange={(e) => onUpdateField?.('accountNumber', e.target.value)}
              />
            </Box>
            <Box>
              <Text as="label" htmlFor="accountName" size="2" weight="bold">Account Name</Text>
              <TextField.Root 
                id="accountName" 
                value={invoiceData.accountName} 
                onChange={(e) => onUpdateField?.('accountName', e.target.value)}
              />
            </Box>
          </Grid>
        )}

        <Separator />

        <Card style={{ padding: '10px' }}>
          <Flex direction="column" gap="3">
            <Flex 
              justify="between" 
              align="center"
              style={{ cursor: 'pointer' }}
              onClick={() => setIsItemsExpanded(!isItemsExpanded)}
            >
              <Text size="4" weight="bold">📦 Invoice Items</Text>
              <Text size="3" style={{ transform: isItemsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                ▼
              </Text>
            </Flex>
            
            {isItemsExpanded && (
              <Flex direction="column" gap="2">
                {items.map((item, index) => (
                  <InvoiceItemCard
                    key={index}
                    item={item}
                    currency={invoiceData.currency}
                    onUpdate={(field, value) => updateItem(index, field, value)}
                  />
                ))}
              </Flex>
            )}
          </Flex>
        </Card>

        <Separator />

        <Text size="4" weight="bold">
          Total: {(() => {
            const currency = getCurrencyByCode(invoiceData.currency);
            const symbol = currency?.symbol || '£';
            return `${symbol}${(totalAmount * 1.2).toFixed(2)} (inc. VAT)`;
          })()}
        </Text>
      </Flex>
    </Card>
  );
};

interface InvoiceItemCardProps {
  item: InvoiceItem;
  currency: string;
  onUpdate: (field: keyof InvoiceItem, value: string | number) => void;
}

const InvoiceItemCard = ({ item, currency, onUpdate }: InvoiceItemCardProps) => (
  <Card style={{ padding: '10px' }}>
    <Grid columns="4" gap="2" align="end">
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
          onChange={(e) => onUpdate('quantity', e.target.value)}
          placeholder="1"
        />
      </Box>
      <Box>
        <Text size="2" weight="bold">Unit Price</Text>
        <TextField.Root
          size="1"
          type="number"
          value={item.unitPrice}
          onChange={(e) => onUpdate('unitPrice', e.target.value)}
          placeholder="0.00"
        />
      </Box>
      <Box >
        <Text size="2" weight="bold">Total</Text><br/>
        <Text size="1" weight="medium">{(() => {
          const quantity = item.quantity === '' || item.quantity === 0 ? 1 : item.quantity;
          const unitPrice = item.unitPrice === '' || item.unitPrice === 0 ? 0 : item.unitPrice;
          const currencyInfo = getCurrencyByCode(currency);
          const symbol = currencyInfo?.symbol || '£';
          return `${symbol}${(quantity * unitPrice).toFixed(2)}`;
        })()}</Text>
      </Box >
    </Grid>
  </Card>
);
