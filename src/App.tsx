import { useState, useEffect, useRef } from 'react';
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

// How long typing has to pause before the PDF is rendered again. A render blocks the page for a few hundred
// milliseconds, so rendering on every keystroke made typing lag.
const TYPING_RENDER_DELAY_MS = 300;

interface RenderedPDF {
  data: InvoiceData;
  blob: Blob;
}

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => generateFakeInvoice());
  const [pdf, setPdf] = useState<RenderedPDF | null>(null);
  const { themePreference, setThemePreference } = useTheme();
  const [bannerDismissed, setBannerDismissed] = useState(getBannerDismissed);
  // Typing waits for a pause before the PDF is rendered; picks and Regenerate render it right away
  const renderDelayRef = useRef(0);

  // Renders the PDF for the latest data only: a newer change cancels a pending render and drops an unfinished one
  useEffect(() => {
    let isStale = false;
    const timer = setTimeout(async () => {
      const blob = await generatePDFBlob(invoiceData);
      if (!isStale) setPdf({ data: invoiceData, blob });
    }, renderDelayRef.current);

    return () => {
      isStale = true;
      clearTimeout(timer);
    };
  }, [invoiceData]);

  const updateInvoiceData = (data: InvoiceData, renderDelay: number) => {
    renderDelayRef.current = renderDelay;
    setInvoiceData(data);
  };

  const handleGenerate = (preserveBankDetails: boolean = false) => {
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
    
    updateInvoiceData(updatedData, 0);
  };

  const handleDownload = async () => {
    // The preview may still be waiting for typing to pause, so render the latest data if it's behind
    const blob = pdf?.data === invoiceData ? pdf.blob : await generatePDFBlob(invoiceData);
    downloadPDF(blob, invoiceData.invoiceNumber);
  };

  const handleUpdateItems = (items: InvoiceItem[]) => {
    updateInvoiceData({ ...invoiceData, items }, TYPING_RENDER_DELAY_MS);
  };

  const handleUpdateBankDetails = (bankDetails: BankDetailsUpdate) => {
    const updatedData = { 
      ...invoiceData, 
      sortCode: bankDetails.sortCode || '', 
      accountNumber: bankDetails.accountNumber || '', 
      accountName: bankDetails.accountName, 
      companyName: bankDetails.accountName,
      iban: bankDetails.iban || '',
      swiftBic: bankDetails.swiftBic || ''
    };
    updateInvoiceData(updatedData, 0);
  };

  const handleUpdateField = (field: keyof InvoiceData, value: string) => {
    // The currency is picked, not typed
    updateInvoiceData({ ...invoiceData, [field]: value }, field === 'currency' ? 0 : TYPING_RENDER_DELAY_MS);
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
          pdfBlob={pdf?.blob ?? null}
          onUpdateItems={handleUpdateItems}
          onUpdateBankDetails={handleUpdateBankDetails}
          onUpdateField={handleUpdateField}
          header={
            // Same height as the preview's tab row, so the logo lines up with "Preview"
            <header className="flex h-(--header-h) items-end justify-between gap-4">
              <div className="flex h-11 min-w-0 items-center gap-3">
                <Logo className="size-8 shrink-0" />
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
            invoiceData={pdf?.data ?? invoiceData}
            pdfBlob={pdf?.blob ?? null}
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
