import { useState, useEffect } from 'react';
import { Theme, Container, Flex, Text, Box } from '@radix-ui/themes';
import { InvoiceForm, PDFPreview } from './components';
import { generateFakeInvoice, generatePDFBlob, downloadPDF } from './utils';
import type { InvoiceData, InvoiceItem } from './types/invoice';
import './App.css';

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(generateFakeInvoice());
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Generate invoice on component mount
  useEffect(() => {
    handleGenerate(false);
  }, []); // Empty dependency array - only run once on mount

  const handleGenerate = async (preserveBankDetails: boolean = false) => {
    const newData = generateFakeInvoice();
    
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

  const handleUpdateBankDetails = async (sortCode: string, accountNumber: string, accountName: string) => {
    const updatedData = { ...invoiceData, sortCode, accountNumber, accountName, companyName: accountName };
    console.log({ updatedData })
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
    <Theme>
      <Container size="4" style={{ height: '100%', padding: '20px' }}>
        <Box mb="4">
          <Text size="6" weight="bold">📄 Sample Invoice Generator</Text>
          <br/>
          <Text size="1">For development and testing purposes only.</Text>
        </Box>
        <Flex direction="row" gap="4" style={{ height: '100%' }}>
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
