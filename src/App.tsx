import { useState, useEffect } from 'react';
import { Theme, Container, Flex, Text, Box, DropdownMenu, IconButton } from '@radix-ui/themes';
import { SunIcon, MoonIcon, DesktopIcon, CheckIcon } from '@radix-ui/react-icons';
import { InvoiceForm, PDFPreview } from './components';
import { generateFakeInvoice, generatePDFBlob, downloadPDF } from './utils';
import type { InvoiceData, InvoiceItem, BankDetailsUpdate } from './types/invoice';
import './App.css';

type ThemePreference = 'system' | 'light' | 'dark';

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

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(generateFakeInvoice());
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [themePreference, setThemePreference] = useState<ThemePreference>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    themePreference === 'system' ? getSystemTheme() : themePreference
  );

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

  return (
    <Theme appearance={resolvedTheme}>
      {/* GitHub Star Banner */}
      <a 
        href="https://github.com/Danilqa/sample-invoice-generator" 
        target="_blank" 
        rel="noopener noreferrer"
        className="github-star-banner"
      >
        ⭐️ Support the project by giving it a star on Github
      </a>
      
      <Container size="4" style={{ height: '100%', padding: '20px', paddingBottom: 0 }}>
        <Flex justify="between" align="start" mb="4">
          <Box>
            <Text size="6" weight="bold">Sample Invoice Generator</Text>
            <br/>
            <Text size="1">For development and testing purposes only.</Text>
          </Box>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" size="2" style={{ color: resolvedTheme === 'dark' ? 'white' : 'black' }}>
                {themePreference === 'system' && <DesktopIcon width="18" height="18" />}
                {themePreference === 'light' && <SunIcon width="18" height="18" />}
                {themePreference === 'dark' && <MoonIcon width="18" height="18" />}
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item onClick={() => setThemePreference('system')}>
                <DesktopIcon width="16" height="16" />
                System
                {themePreference === 'system' && <CheckIcon style={{ marginLeft: 'auto' }} />}
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => setThemePreference('light')}>
                <SunIcon width="16" height="16" />
                Light
                {themePreference === 'light' && <CheckIcon style={{ marginLeft: 'auto' }} />}
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => setThemePreference('dark')}>
                <MoonIcon width="16" height="16" />
                Dark
                {themePreference === 'dark' && <CheckIcon style={{ marginLeft: 'auto' }} />}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
        <Flex 
          direction={{ initial: 'column', md: 'row' }} 
          gap="4" 
          style={{ height: '100%' }}
        >
          <InvoiceForm 
            invoiceData={invoiceData}
            onGenerate={handleGenerate}
            onDownload={handleDownload}
            pdfBlob={pdfBlob}
            onUpdateItems={handleUpdateItems}
            onUpdateBankDetails={handleUpdateBankDetails}
            onUpdateField={handleUpdateField}
          />
          <PDFPreview 
            invoiceData={invoiceData}
            pdfBlob={pdfBlob}
          />
        </Flex>
        
        {/* Footer */}
        <Box mt="2" style={{ textAlign: 'center' }}>
          <Text size="2" color="gray">
            Vibe-coded with 💛 by{' '}
            <a 
              href="https://github.com/Danilqa/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Dan
            </a>
          </Text>
        </Box>
      </Container>
    </Theme>
  );
}

export default App;
