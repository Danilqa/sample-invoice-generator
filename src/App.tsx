import { useState, useEffect } from 'react';
import { ArrowUpRight, Monitor, Moon, Star, Sun } from 'lucide-react';
import { InvoiceForm, PDFPreview } from './components';
import { Logo } from './components/Logo';
import { generateFakeInvoice, generatePDFBlob, downloadPDF } from './utils';
import type { InvoiceData, InvoiceItem, BankDetailsUpdate } from './types/invoice';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ThemePreference = 'system' | 'light' | 'dark';

const themeOptions = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const;

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getStoredTheme(): ThemePreference {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-preference');
    if (stored === 'system' || stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  return 'system';
}

function getBannerDismissed(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('banner-dismissed') === 'true';
  }
  return false;
}

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(generateFakeInvoice());
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [themePreference, setThemePreference] = useState<ThemePreference>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    themePreference === 'system' ? getSystemTheme() : themePreference
  );
  const [bannerDismissed, setBannerDismissed] = useState(getBannerDismissed);

  // Handle theme changes
  useEffect(() => {
    localStorage.setItem('theme-preference', themePreference);
    
    if (themePreference === 'system') {
      setResolvedTheme(getSystemTheme());
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setResolvedTheme(themePreference);
    }
  }, [themePreference]);

  // Apply the theme the shadcn way: a .dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

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

  const ThemeIcon = themeOptions.find((option) => option.value === themePreference)?.Icon ?? Monitor;

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      {/* GitHub Star Banner */}
      {!bannerDismissed && (
        <a 
          href="https://github.com/Danilqa/sample-invoice-generator" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex h-9 shrink-0 items-center justify-center gap-2 bg-[#0a0a0a] px-4 text-[13px] text-white/90 outline-none transition-colors hover:text-white focus-visible:underline dark:border-b dark:border-white/[0.08] dark:bg-[#1a1a1a]"
          onClick={() => {
            localStorage.setItem('banner-dismissed', 'true');
            setBannerDismissed(true);
          }}
        >
          <Star className="size-3.5 shrink-0 fill-current" aria-hidden="true" />
          <span className="truncate">Support this app by giving it a star on GitHub</span>
          <ArrowUpRight
            className="size-3.5 shrink-0 opacity-50 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
            aria-hidden="true"
          />
        </a>
      )}
      
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Logo className="size-7 shrink-0" />
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="truncate text-[12.5px] leading-none font-semibold tracking-[0.22em] uppercase">
              Test Invoice Generator
            </h1>
            <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
            <p className="truncate text-xs leading-none text-muted-foreground sm:text-[13px]">
              For development and testing purposes only
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Change theme" className="text-foreground/70">
              <ThemeIcon className="size-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className="w-44">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={themePreference}
              onValueChange={(value) => setThemePreference(value as ThemePreference)}
            >
              {themeOptions.map(({ value, label, Icon }) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  <Icon className="text-muted-foreground" />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <InvoiceForm
          invoiceData={invoiceData}
          onGenerate={handleGenerate}
          onDownload={handleDownload}
          pdfBlob={pdfBlob}
          onUpdateItems={handleUpdateItems}
          onUpdateBankDetails={handleUpdateBankDetails}
          onUpdateField={handleUpdateField}
        />

        <section
          aria-label="Invoice preview"
          className="bg-canvas-gradient flex flex-1 flex-col border-t px-4 pt-6 pb-5 sm:px-8 lg:min-h-0 lg:border-t-0 lg:px-10 lg:pt-7"
        >
          <PDFPreview 
            invoiceData={invoiceData}
            pdfBlob={pdfBlob}
          />
        
          {/* Footer */}
          <footer className="pt-4 text-center text-xs text-muted-foreground">
            Vibe-coded with 💛 by{' '}
            <a 
              href="https://github.com/Danilqa/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground/80 underline decoration-foreground/25 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-foreground/60"
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
