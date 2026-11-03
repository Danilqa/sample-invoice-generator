import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Download, RefreshCw, Shuffle } from 'lucide-react';
import type { InvoiceData, InvoiceItem, BankDetailsUpdate } from '../types/invoice';
import { getBankDetailsByCurrency, generateRandomInvalidBankDetails } from '../utils/bankDetails';
import type { BankDetails } from '../utils/bankDetails';
import { currencies, getCurrencyByCode } from '../utils/currencies';
import { useHotkey } from '../hooks/useHotkey';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  // Rendered at the top of the column, above the page heading (logo and app name)
  header?: ReactNode;
}

export const InvoiceForm = ({ invoiceData, onGenerate, onDownload, pdfBlob, onUpdateItems, onUpdateBankDetails, onUpdateField, header }: InvoiceFormProps) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedBankDetails, setSelectedBankDetails] = useState<string>('');
  const [isBankListOpen, setIsBankListOpen] = useState(false);
  const bankTriggerRef = useRef<HTMLButtonElement>(null);

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
  const renderTextField = (field: keyof InvoiceData, label: string, options: { hint?: string; className?: string; placeholder?: string } = {}) => (
    <Field id={field} label={label} hint={options.hint} className={options.className}>
      <Input
        id={field}
        value={invoiceData[field] as string}
        placeholder={options.placeholder}
        onChange={(e) => onUpdateField?.(field, e.target.value)}
        aria-describedby={options.hint ? `${field}-hint` : undefined}
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
      {/* Desktop: only this column scrolls; it ends where the action bar starts.
          `relative` makes it the containing block of the sr-only labels, so they scroll with it
          instead of stretching the page below the fold. */}
      <div className="scrollbar-subtle relative lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
        {/* Query container for the @bank-row / @item-row layouts below (sizes in index.css) */}
        <div className="@container mx-auto w-full max-w-[600px] px-5 pb-12 sm:px-8 lg:px-10 lg:pb-10">
          {header}

          <div className="mt-5 lg:mt-6 short:mt-3">
            <h2 id="invoice-details-title" className="text-[28px] leading-tight font-normal tracking-[-0.02em] short:text-2xl">
              Invoice details
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground short:mt-1 short:text-[13px]">
              For development and testing purposes only.
            </p>
          </div>

          {/* Mobile and tablet: pill actions under the heading, like Mercury's home actions */}
          <div className="mt-6 grid grid-cols-2 gap-2 sm:flex lg:hidden">
            <FormActions onGenerate={onGenerate} onDownload={onDownload} pdfBlob={pdfBlob} />
          </div>

          <FormSection title="Invoice" description="Number, dates and who the invoice is from.">
            <div className="grid grid-cols-2 gap-x-3 gap-y-(--row-gap) sm:grid-cols-3">
              {renderTextField('invoiceNumber', 'Invoice number', { className: 'col-span-2 sm:col-span-1' })}
              {renderTextField('issueDate', 'Issue date', { placeholder: 'DD/MM/YYYY' })}
              {renderTextField('dueDate', 'Due date', { placeholder: 'DD/MM/YYYY' })}
              {renderTextField('companyName', 'Company name', {
                className: 'col-span-2 sm:col-span-3',
                hint: 'Follows the bank details you pick below.',
              })}
            </div>
          </FormSection>

          <FormSection title="Bank details" description="Where the invoice asks to be paid.">
            <div className="flex flex-col gap-(--row-gap)">
              <div className="flex flex-col gap-2 short:gap-1.5">
                <span id="currency-label" className="text-[13px] leading-none text-foreground/70">Currency</span>
                <ToggleGroup
                  type="single"
                  value={invoiceData.currency}
                  onValueChange={(value) => {
                    // Radix clears the value when the active item is clicked again; ignore that
                    if (value) onUpdateField?.('currency', value);
                  }}
                  aria-labelledby="currency-label"
                  className="grid w-full grid-cols-3"
                >
                  {currencies.map((currency) => (
                    <ToggleGroupItem
                      key={currency.code}
                      value={currency.code}
                      aria-label={`${currency.name} (${currency.code})`}
                      title={currency.name}
                    >
                      <span aria-hidden="true" className="text-[15px] leading-none">{currency.flag}</span>
                      <span className="tracking-wide">{currency.code}</span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <Field id="bankDetails" label="Bank details" hint="Real charity bank details from public sources.">
                <Select
                  value={selectedBankDetails}
                  onValueChange={handleBankDetailsChange}
                  open={isBankListOpen}
                  onOpenChange={(open) => {
                    if (open) makeRoomBelow(bankTriggerRef.current);
                    setIsBankListOpen(open);
                  }}
                >
                  {/* `peer` lets the hint below hide while the list covers it (see Field) */}
                  <SelectTrigger ref={bankTriggerRef} id="bankDetails" aria-describedby="bankDetails-hint" className="peer">
                    <SelectValue placeholder="Choose bank details..." />
                  </SelectTrigger>
                  {/* Always opens downwards so the list never covers the field's label */}
                  <SelectContent
                    side="bottom"
                    avoidCollisions={false}
                    className="max-h-[min(var(--radix-select-content-available-height),380px)] w-(--radix-select-trigger-width)"
                  >
                    <SelectGroup>
                      <SelectLabel>Charities · {invoiceData.currency}</SelectLabel>
                      {currentBankDetails.map((details) => (
                        <SelectItem key={details.name} value={details.name} description={describeBankDetails(details)}>
                          {details.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectItem
                      value="random"
                      icon={<Shuffle />}
                      description="Fake company name with made-up account numbers"
                    >
                      Generate random invalid
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {isEURCurrency(invoiceData.currency) ? (
                <div className="grid grid-cols-1 gap-x-3 gap-y-(--row-gap)">
                  {renderTextField('iban', 'IBAN')}
                  {renderTextField('accountName', 'Account name')}
                </div>
              ) : isUSDCurrency(invoiceData.currency) ? (
                <div className="grid grid-cols-1 gap-x-3 gap-y-(--row-gap) @bank-row:grid-cols-[minmax(0,1fr)_10.5rem]">
                  {renderTextField('iban', 'IBAN')}
                  {renderTextField('swiftBic', 'Swift/BIC')}
                  {renderTextField('accountName', 'Account name', { className: '@bank-row:col-span-2' })}
                </div>
              ) : (
                // Sort code and account number are fixed-length, so the account name gets the rest of the row
                <div className="grid grid-cols-2 gap-x-3 gap-y-(--row-gap) @bank-row:grid-cols-[6rem_6.5rem_minmax(0,1fr)]">
                  {renderTextField('sortCode', 'Sort code')}
                  {renderTextField('accountNumber', 'Account number')}
                  {renderTextField('accountName', 'Account name', { className: 'col-span-2 @bank-row:col-span-1' })}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="Line items" description="Two items on the invoice. VAT at 20% is added to the total.">
            {/* Wide columns: one table-like grid. The header and rows share its columns (subgrid), so the
                Amount column can grow to fit a large typed-in amount and everything stays aligned. */}
            <div className="@item-row:grid @item-row:grid-cols-[minmax(0,1fr)_3.25rem_6.5rem_minmax(5.5rem,max-content)] @item-row:gap-x-2">
              <div
                aria-hidden="true"
                className="hidden pb-2 text-[13px] leading-none text-foreground/70 @item-row:col-span-full @item-row:grid @item-row:grid-cols-subgrid"
              >
                <span>Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit price</span>
                <span className="text-right">Amount</span>
              </div>
              <ul className="flex flex-col gap-y-4 @item-row:col-span-full @item-row:grid @item-row:grid-cols-subgrid @item-row:gap-y-2">
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
            </div>

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
        </div>
      </div>

      {/* Desktop: Mercury-style action bar pinned under the scrolling form, outside the scroll area */}
      <div className="hidden border-t bg-background lg:block lg:[scrollbar-gutter:stable] lg:overflow-hidden">
        <div className="mx-auto flex w-full max-w-[600px] justify-end gap-2 px-10 py-(--bar-py)">
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
    <Button variant="secondary" onClick={() => onGenerate(true)} className="short:h-9 sm:has-[kbd]:pr-2.5">
      <RefreshCw data-icon="inline-start" />
      Regenerate data
      <Kbd className="ml-1 hidden bg-foreground/[0.07] sm:inline-flex">R</Kbd>
    </Button>
    <Button onClick={onDownload} disabled={!pdfBlob} className="short:h-9 sm:has-[kbd]:pr-2.5">
      <Download data-icon="inline-start" />
      Download PDF
      <Kbd className="ml-1 hidden bg-primary-foreground/15 text-primary-foreground/75 sm:inline-flex">D</Kbd>
    </Button>
  </>
);

// The bank list always opens downwards so it never covers the field's label. When the field sits near the
// bottom of the screen, scroll its container just enough first to leave room for a useful list.
const BANK_LIST_ROOM = 300;

const makeRoomBelow = (trigger: HTMLElement | null) => {
  if (!trigger) return;
  const shortfall = BANK_LIST_ROOM - (window.innerHeight - trigger.getBoundingClientRect().bottom);
  if (shortfall <= 0) return;

  let scroller = trigger.parentElement;
  while (scroller && !/auto|scroll/.test(getComputedStyle(scroller).overflowY)) {
    scroller = scroller.parentElement;
  }
  (scroller ?? document.scrollingElement)?.scrollBy({ top: shortfall });
};

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

// The description is dropped on short laptop screens so Invoice and Bank details fit above the action bar
const FormSection = ({ title, description, children }: FormSectionProps) => (
  <section className="mt-(--section-gap) border-t pt-(--section-gap)">
    <h3 className="text-[15px] leading-tight font-medium">{title}</h3>
    <p className="mt-1 text-[13px] text-muted-foreground short:hidden">{description}</p>
    <div className="mt-4 short:mt-3">{children}</div>
  </section>
);

interface FieldProps {
  id: string;
  label: string;
  // Rendered under the control with id `${id}-hint`; point the control's aria-describedby at it
  hint?: string;
  className?: string;
  children: ReactNode;
}

const Field = ({ id, label, hint, className, children }: FieldProps) => (
  <div className={cn('flex min-w-0 flex-col gap-2 short:gap-1.5', className)}>
    <Label htmlFor={id} className="text-[13px] leading-none font-normal whitespace-nowrap text-foreground/70">{label}</Label>
    {children}
    {/* Hidden while an open select list covers it, so its first letter can't peek out at the list's rounded corner */}
    {hint && <p id={`${id}-hint`} className="text-xs leading-snug text-muted-foreground peer-data-[state=open]:invisible">{hint}</p>}
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

  // Narrow columns stack each item: the description on its own row, then Qty / Unit price / Amount with labels
  return (
    <li className="grid grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1fr)] items-end gap-2 @item-row:col-span-full @item-row:grid-cols-subgrid @item-row:items-center">
      <div className="col-span-3 flex flex-col gap-2 @item-row:col-span-1">
        <Label htmlFor={`${prefix}-description`} className="text-[13px] leading-none font-normal text-foreground/70 @item-row:sr-only">
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
        <Label htmlFor={`${prefix}-quantity`} className="text-xs leading-none font-normal text-muted-foreground @item-row:sr-only">Qty</Label>
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
        <Label htmlFor={`${prefix}-unit-price`} className="text-xs leading-none font-normal text-muted-foreground @item-row:sr-only">Unit price</Label>
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
        <span className="text-right text-xs leading-none text-muted-foreground @item-row:sr-only">Amount</span>
        <span className="flex h-(--field-h) items-center justify-end text-sm whitespace-nowrap tabular-nums">
          {formatAmount(quantity * unitPrice, currencySymbol)}
        </span>
      </div>
    </li>
  );
};
