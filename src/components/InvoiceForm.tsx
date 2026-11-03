import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import type { InvoiceData, InvoiceItem, BankDetailsUpdate } from '../types/invoice';
import { getBankDetailsByCurrency, generateRandomInvalidBankDetails } from '../utils/bankDetails';
import type { BankDetails } from '../utils/bankDetails';
import { currencies, getCurrencyByCode } from '../utils/currencies';
import { useHotkey } from '../hooks/useHotkey';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Amount } from '@/components/Amount';
import { formatAmount } from '@/lib/format';
import { cn } from '@/lib/utils';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onGenerate: (preserveBankDetails?: boolean) => void;
  onDownload: () => void;
  pdfBlob: Blob | null;
  onUpdateItems?: (items: InvoiceItem[]) => void;
  onUpdateBankDetails?: (bankDetails: BankDetailsUpdate) => void;
  onUpdateField?: (field: keyof InvoiceData, value: string) => void;
}

export const InvoiceForm = ({ invoiceData, onGenerate, onDownload, pdfBlob, onUpdateItems, onUpdateBankDetails, onUpdateField }: InvoiceFormProps) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedBankDetails, setSelectedBankDetails] = useState<string>('');

  // Keyboard shortcuts
  useHotkey('r', () => onGenerate(true));
  useHotkey('d', () => onDownload(), !!pdfBlob);

  // Helper function to handle currency-specific logic
  const handleCurrencySpecificLogic = (currency: string, callback: (type: 'GBP' | 'EUR' | 'USD') => void) => {
    switch (currency) {
      case 'EUR':
        callback('EUR');
        break;
      case 'USD':
        callback('USD');
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
      case 'USD':
      default:
        return false;
    }
  };

  // Helper function to check if currency is USD
  const isUSDCurrency = (currency: string): boolean => {
    switch (currency) {
      case 'USD':
        return true;
      case 'GBP':
      case 'EUR':
      default:
        return false;
    }
  };

  // Get bank details based on current currency
  const currentBankDetails = getBankDetailsByCurrency(invoiceData.currency as 'GBP' | 'EUR' | 'USD');
  
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
          onUpdateBankDetails?.({
            accountName: firstBank.name,
            iban: firstBank.iban || ''
          });
        } else if (currencyType === 'USD') {
          onUpdateBankDetails?.({
            accountName: firstBank.name,
            iban: firstBank.iban || '',
            swiftBic: firstBank.swiftBic || ''
          });
        } else {
          onUpdateBankDetails?.({
            sortCode: firstBank.sortCode || '',
            accountNumber: firstBank.accountNumber || '',
            accountName: firstBank.name
          });
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
      const randomDetails = generateRandomInvalidBankDetails(invoiceData.currency as 'GBP' | 'EUR' | 'USD');
      handleCurrencySpecificLogic(invoiceData.currency, (currencyType) => {
        if (currencyType === 'EUR') {
          onUpdateBankDetails?.({
            accountName: randomDetails.name,
            iban: randomDetails.iban || ''
          });
        } else if (currencyType === 'USD') {
          onUpdateBankDetails?.({
            accountName: randomDetails.name,
            iban: randomDetails.iban || '',
            swiftBic: randomDetails.swiftBic || ''
          });
        } else {
          onUpdateBankDetails?.({
            sortCode: randomDetails.sortCode || '',
            accountNumber: randomDetails.accountNumber || '',
            accountName: randomDetails.name
          });
        }
      });
    } else {
      const selectedDetails = currentBankDetails.find(bank => bank.name === value);
      if (selectedDetails) {
        handleCurrencySpecificLogic(invoiceData.currency, (currencyType) => {
          if (currencyType === 'EUR') {
            onUpdateBankDetails?.({
              accountName: selectedDetails.name,
              iban: selectedDetails.iban || ''
            });
          } else if (currencyType === 'USD') {
            onUpdateBankDetails?.({
              accountName: selectedDetails.name,
              iban: selectedDetails.iban || '',
              swiftBic: selectedDetails.swiftBic || ''
            });
          } else {
            onUpdateBankDetails?.({
              sortCode: selectedDetails.sortCode || '',
              accountNumber: selectedDetails.accountNumber || '',
              accountName: selectedDetails.name
            });
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

  const currencySymbol = getCurrencyByCode(invoiceData.currency)?.symbol || '£';

  // Plain text field bound to a top-level invoice field
  const renderTextField = (field: keyof InvoiceData, label: string, options: { hint?: ReactNode; className?: string; placeholder?: string } = {}) => (
    <Field id={field} label={label} hint={options.hint} className={options.className}>
      <Input
        id={field}
        value={invoiceData[field] as string}
        placeholder={options.placeholder}
        onChange={(e) => onUpdateField?.(field, e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
    </Field>
  );

  return (
    <section
      aria-labelledby="invoice-details-title"
      className="flex flex-col bg-background lg:min-h-0 lg:w-[clamp(480px,42vw,620px)] lg:shrink-0 lg:border-r"
    >
      <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:[scrollbar-color:var(--scrollbar)_transparent] lg:[scrollbar-gutter:stable] lg:[scrollbar-width:thin]">
        <div className="mx-auto w-full max-w-[600px] px-5 pt-8 pb-12 sm:px-8 lg:px-10 lg:pt-10">
          <h2 id="invoice-details-title" className="text-[28px] leading-tight font-normal tracking-[-0.02em] sm:text-[30px]">
            Invoice details
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Realistic fake data. Edit any field and the preview updates.
          </p>

          {/* Mobile and tablet: pill actions under the heading, like Mercury's home actions */}
          <div className="mt-6 grid grid-cols-2 gap-2 sm:flex lg:hidden">
            <FormActions onGenerate={onGenerate} onDownload={onDownload} pdfBlob={pdfBlob} />
          </div>

          <FormSection title="Invoice" description="Number, dates and who the invoice is from.">
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
              {renderTextField('invoiceNumber', 'Invoice number', { className: 'col-span-2 sm:col-span-1' })}
              {renderTextField('issueDate', 'Issue date', { placeholder: 'DD/MM/YYYY' })}
              {renderTextField('dueDate', 'Due date', { placeholder: 'DD/MM/YYYY' })}
              {renderTextField('companyName', 'Company name', {
                className: 'col-span-2 sm:col-span-3',
                hint: 'Follows the bank details you pick below.',
              })}
            </div>
          </FormSection>

          <FormSection title="Line items" description="Two items on the invoice. VAT at 20% is added to the total.">
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,1fr)_3.5rem_6.5rem_5.75rem] gap-2 pb-2 text-[13px] leading-none text-foreground/70 sm:grid"
            >
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit price</span>
              <span className="text-right">Amount</span>
            </div>
            <ul className="flex flex-col gap-4 sm:gap-2">
              {items.map((item, index) => (
                <LineItemRow
                  key={index}
                  index={index}
                  item={item}
                  currencySymbol={currencySymbol}
                  onUpdate={(field, value) => updateItem(index, field, value)}
                />
              ))}
            </ul>

            <dl className="mt-6 border-t pt-4 text-sm">
              <div className="flex items-baseline justify-between py-1">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatAmount(totalAmount, currencySymbol)}</dd>
              </div>
              <div className="flex items-baseline justify-between py-1">
                <dt className="text-muted-foreground">VAT (20%)</dt>
                <dd className="tabular-nums">{formatAmount(totalAmount * 0.2, currencySymbol)}</dd>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t pt-4">
                <dt className="text-[17px] font-normal text-foreground/80">Total incl. VAT</dt>
                <dd>
                  <Amount value={totalAmount * 1.2} symbol={currencySymbol} className="text-[26px] leading-none font-normal tracking-[-0.02em]" />
                </dd>
              </div>
            </dl>
          </FormSection>

          <FormSection title="Bank details" description="Where the invoice asks to be paid.">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span id="currency-label" className="text-[13px] leading-none text-foreground/70">Currency</span>
                <ToggleGroup
                  type="single"
                  value={invoiceData.currency}
                  onValueChange={(value) => {
                    // Radix clears the value when the active item is clicked again; ignore that
                    if (value) onUpdateField?.('currency', value);
                  }}
                  aria-labelledby="currency-label"
                  spacing={0}
                  className="grid h-10 w-full grid-cols-3 gap-0 rounded-[10px] border border-input/70 bg-secondary p-[3px] dark:bg-white/[0.03]"
                >
                  {currencies.map((currency) => (
                    <ToggleGroupItem
                      key={currency.code}
                      value={currency.code}
                      aria-label={`${currency.name} (${currency.code})`}
                      title={currency.name}
                      className="h-full gap-2 rounded-[7px]! px-2! text-[13px] font-medium text-muted-foreground shadow-none! transition-[color,background-color,box-shadow] hover:bg-transparent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/15 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.04)]! dark:data-[state=on]:bg-white/[0.1] dark:data-[state=on]:shadow-[0_1px_2px_rgb(0_0_0/0.5)]!"
                    >
                      <span aria-hidden="true" className="text-[15px] leading-none">{currency.flag}</span>
                      <span className="tracking-wide">{currency.code}</span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <Field id="bankDetails" label="Bank details" hint="Real charity bank details from public sources.">
                <Select value={selectedBankDetails} onValueChange={handleBankDetailsChange}>
                  <SelectTrigger id="bankDetails" className="w-full">
                    <SelectValue placeholder="Choose bank details..." />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={6} className="max-h-[min(var(--radix-select-content-available-height),360px)]">
                    {currentBankDetails.map((details) => (
                      <SelectItem key={details.name} value={details.name} description={describeBankDetails(details)}>
                        {details.name}
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem value="random" description="Fake company name with made-up account numbers">
                      Generate random invalid
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {isEURCurrency(invoiceData.currency) ? (
                <div className="grid grid-cols-1 gap-x-3 gap-y-5">
                  {renderTextField('iban', 'IBAN')}
                  {renderTextField('accountName', 'Account name')}
                </div>
              ) : isUSDCurrency(invoiceData.currency) ? (
                <div className="grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-[minmax(0,1fr)_10.5rem]">
                  {renderTextField('iban', 'IBAN')}
                  {renderTextField('swiftBic', 'Swift/BIC')}
                  {renderTextField('accountName', 'Account name', { className: 'sm:col-span-2' })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                  {renderTextField('sortCode', 'Sort code')}
                  {renderTextField('accountNumber', 'Account number')}
                  {renderTextField('accountName', 'Account name', { className: 'col-span-2' })}
                </div>
              )}
            </div>
          </FormSection>
        </div>
      </div>

      {/* Desktop: Mercury-style footer bar pinned under the scrolling form */}
      <div className="hidden border-t bg-background lg:block">
        <div className="mx-auto flex w-full max-w-[600px] justify-end gap-2 px-10 py-4">
          <FormActions onGenerate={onGenerate} onDownload={onDownload} pdfBlob={pdfBlob} />
        </div>
      </div>
    </section>
  );
};

interface FormActionsProps {
  onGenerate: (preserveBankDetails?: boolean) => void;
  onDownload: () => void;
  pdfBlob: Blob | null;
}

const FormActions = ({ onGenerate, onDownload, pdfBlob }: FormActionsProps) => (
  <>
    <Button variant="secondary" onClick={() => onGenerate(true)} className="sm:has-[kbd]:pr-2.5">
      <RefreshCw data-icon="inline-start" />
      Regenerate data
      <Kbd className="ml-1 hidden bg-foreground/[0.07] sm:inline-flex">R</Kbd>
    </Button>
    <Button onClick={onDownload} disabled={!pdfBlob} className="sm:has-[kbd]:pr-2.5">
      <Download data-icon="inline-start" />
      Download PDF
      <Kbd className="ml-1 hidden bg-primary-foreground/15 text-primary-foreground/75 sm:inline-flex">D</Kbd>
    </Button>
  </>
);

// Secondary line under each bank option, like account numbers in Mercury's pickers
const describeBankDetails = (details: BankDetails): string => {
  if (details.sortCode) return `${details.sortCode} · ${details.accountNumber}`;
  if (details.swiftBic) return `${details.iban} · ${details.swiftBic}`;
  return details.iban || '';
};

interface FormSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

const FormSection = ({ title, description, children }: FormSectionProps) => (
  <section className="mt-8 border-t pt-7">
    <h3 className="text-[15px] leading-tight font-medium">{title}</h3>
    <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
    <div className="mt-5">{children}</div>
  </section>
);

interface FieldProps {
  id: string;
  label: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

const Field = ({ id, label, hint, className, children }: FieldProps) => (
  <div className={cn('flex min-w-0 flex-col gap-2', className)}>
    <Label htmlFor={id} className="text-[13px] font-normal text-foreground/70">{label}</Label>
    {children}
    {hint && <p className="text-xs leading-snug text-muted-foreground">{hint}</p>}
  </div>
);

interface LineItemRowProps {
  index: number;
  item: InvoiceItem;
  currencySymbol: string;
  onUpdate: (field: keyof InvoiceItem, value: string | number) => void;
}

const numberInputClass = 'text-right tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

const LineItemRow = ({ index, item, currencySymbol, onUpdate }: LineItemRowProps) => {
  const quantity = item.quantity === '' || item.quantity === 0 ? 1 : item.quantity;
  const unitPrice = item.unitPrice === '' || item.unitPrice === 0 ? 0 : item.unitPrice;
  const prefix = `item-${index}`;

  return (
    <li className="grid grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1fr)] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_3.5rem_6.5rem_5.75rem] sm:items-center">
      <div className="col-span-3 flex flex-col gap-2 sm:col-span-1">
        <Label htmlFor={`${prefix}-description`} className="text-[13px] font-normal text-foreground/70 sm:sr-only">
          Item {index + 1}
        </Label>
        <Input
          id={`${prefix}-description`}
          value={item.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Enter description"
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${prefix}-quantity`} className="text-xs font-normal text-muted-foreground sm:sr-only">Qty</Label>
        <Input
          id={`${prefix}-quantity`}
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdate('quantity', e.target.value)}
          placeholder="1"
          className={numberInputClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${prefix}-unit-price`} className="text-xs font-normal text-muted-foreground sm:sr-only">Unit price</Label>
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            {currencySymbol}
          </span>
          <Input
            id={`${prefix}-unit-price`}
            type="number"
            value={item.unitPrice}
            onChange={(e) => onUpdate('unitPrice', e.target.value)}
            placeholder="0.00"
            className={cn(numberInputClass, 'pl-7')}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-right text-xs text-muted-foreground sm:sr-only">Amount</span>
        <span className="flex h-10 items-center justify-end text-sm tabular-nums">
          {formatAmount(quantity * unitPrice, currencySymbol)}
        </span>
      </div>
    </li>
  );
};
