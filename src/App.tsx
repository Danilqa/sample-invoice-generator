import { useState, useEffect } from 'react';
import { InvoiceForm, PDFPreview } from './components';
import { Logo } from './components/Logo';
import { StarBanner } from './components/StarBanner';
import { ThemeMenu } from './components/ThemeMenu';
import { useTheme } from './hooks/useTheme';
import { generateFakeInvoice, generatePDFBlob, downloadPDF } from './utils';
import type { InvoiceData, InvoiceItem, BankDetailsUpdate } from './types/invoice';

function getBannerDismissed(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('banner-dismissed') === 'true';
  }
  return false;
}

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(generateFakeInvoice());
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const { themePreference, setThemePreference } = useTheme();
  const [bannerDismissed, setBannerDismissed] = useState(getBannerDismissed);

  // Generate invoice on component mount
  useEffect(() => {
    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      handleGenerate(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array - only run once on mount

  const handleGenerate = async (preserveBankDetails: boolean = false) => {
    const newData = generateFakeInvoice(invoiceData.currency as 'GBP' | 'EUR' | 'USD');
    
    // Preserve contact information (client details)
    const updatedData = {
      ...newData,
      clientName: invoiceData.clientName,
      clientAddress: invoiceData.clientAddress,
      clientEmail: invoiceData.clientEmail,
    };
    
    // Preserve bank details if requested
    if (preserveBankDetails) {
      updatedData.sortCode = invoiceData.sortCode;
      updatedData.accountNumber = invoiceData.accountNumber;
      updatedData.accountName = invoiceData.accountName;
      updatedData.iban = invoiceData.iban;
      updatedData.swiftBic = invoiceData.swiftBic;
    }
    
    setInvoiceData(updatedData);
    
    // Generate PDF blob
    const blob = await generatePDFBlob(updatedData);
    setPdfBlob(blob);
  };

  const handleDownload = () => {
    if (pdfBlob) {
      downloadPDF(pdfBlob, invoiceData.invoiceNumber);
    }
  };

  const handleUpdateItems = async (items: InvoiceItem[]) => {
    const updatedData = { ...invoiceData, items };
    setInvoiceData(updatedData);
    
    // Regenerate PDF blob with updated items
    const blob = await generatePDFBlob(updatedData);
    setPdfBlob(blob);
  };

  const handleUpdateBankDetails = async (bankDetails: BankDetailsUpdate) => {
    const updatedData = { 
      ...invoiceData, 
      sortCode: bankDetails.sortCode || '', 
      accountNumber: bankDetails.accountNumber || '', 
      accountName: bankDetails.accountName, 
      companyName: bankDetails.accountName,
      iban: bankDetails.iban || '',
      swiftBic: bankDetails.swiftBic || ''
    };
    setInvoiceData(updatedData);
    
    // Regenerate PDF blob with updated bank details
    const blob = await generatePDFBlob(updatedData);
    setPdfBlob(blob);
  };

  const handleUpdateField = async (field: keyof InvoiceData, value: string) => {
    const updatedData = { ...invoiceData, [field]: value };
    setInvoiceData(updatedData);
    
    // Regenerate PDF blob with updated field
    const blob = await generatePDFBlob(updatedData);
    setPdfBlob(blob);
  };

  const dismissBanner = () => {
    localStorage.setItem('banner-dismissed', 'true');
    setBannerDismissed(true);
  };

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      {/* GitHub Star Banner */}
      {!bannerDismissed && <StarBanner onDismiss={dismissBanner} />}

      <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <InvoiceForm
          invoiceData={invoiceData}
          onGenerate={handleGenerate}
          onDownload={handleDownload}
          pdfBlob={pdfBlob}
          onUpdateItems={handleUpdateItems}
          onUpdateBankDetails={handleUpdateBankDetails}
          onUpdateField={handleUpdateField}
          header={
            // Same height as the preview's tab row, so the logo lines up with "Preview"
            <header className="flex h-(--header-h) items-end justify-between gap-4">
              <div className="flex h-11 min-w-0 items-center gap-3">
                <Logo className="size-7 shrink-0" />
                <h1 className="truncate text-[12.5px] leading-none font-semibold tracking-[0.22em] uppercase">
                  Test Invoice Generator
                </h1>
              </div>
              {/* The theme menu sits in the preview's tab row on desktop */}
              <div className="flex h-11 items-center lg:hidden">
                <ThemeMenu value={themePreference} onChange={setThemePreference} className="-mr-2" />
              </div>
            </header>
          }
        />

        <section
          aria-label="Invoice preview"
          className="bg-canvas-gradient flex flex-1 flex-col border-t px-5 pb-5 sm:px-8 lg:min-h-0 lg:min-w-0 lg:border-t-0 lg:px-10"
        >
          <PDFPreview
            invoiceData={invoiceData}
            pdfBlob={pdfBlob}
            actions={
              <ThemeMenu
                value={themePreference}
                onChange={setThemePreference}
                className="-mr-2 hidden lg:inline-flex"
              />
            }
          />

          {/* Footer */}
          <footer className="pt-4 text-center text-xs text-muted-foreground">
            Vibe-coded with 💛 by{' '}
            <a
              href="https://github.com/Danilqa/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-foreground/80 underline decoration-foreground/25 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-foreground/60 outline-none keyboard-focus:outline-solid keyboard-focus:outline-2 keyboard-focus:outline-offset-2"
            >
              Dan
            </a>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
