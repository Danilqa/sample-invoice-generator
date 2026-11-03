import { PDFViewer } from '@react-pdf/renderer';
import { ArrowUpRight } from 'lucide-react';
import { InvoicePDF } from './InvoicePDF';
import type { InvoiceData } from '../types/invoice';

// Opens the same blob the Download button saves, in the browser's full PDF viewer
const openPDFInNewTab = (pdfBlob: Blob) => {
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
  // Give the new tab time to load the blob before releasing it
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

interface PDFPreviewProps {
  invoiceData: InvoiceData;
  pdfBlob: Blob | null;
}

export const PDFPreview = ({ invoiceData, pdfBlob }: PDFPreviewProps) => {
  // Create a unique key that changes whenever any relevant data changes
  const pdfKey = JSON.stringify({
    invoiceNumber: invoiceData.invoiceNumber,
    sortCode: invoiceData.sortCode,
    accountNumber: invoiceData.accountNumber,
    accountName: invoiceData.accountName,
    iban: invoiceData.iban,
    companyName: invoiceData.companyName,
    clientName: invoiceData.clientName,
    currency: invoiceData.currency,
    items: invoiceData.items
  });

  return (
    // Capped near A4 at 100% zoom: wider than that and the browser viewer stops fitting the page to the width
    <div className="mx-auto flex w-full max-w-[600px] flex-col lg:min-h-0 lg:max-w-[790px] lg:flex-1">
      {/* Tab row, like the Invoice / Payment link tabs above Mercury's preview */}
      <div className="flex items-end justify-between gap-4 border-b border-foreground/[0.08]">
        <span className="relative pb-3 text-sm font-medium">
          Preview
          <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[1.5px] rounded-full bg-foreground" />
        </span>
        <button
          type="button"
          onClick={() => pdfBlob && openPDFInNewTab(pdfBlob)}
          disabled={!pdfBlob}
          title="Open the PDF in a new tab to zoom or print"
          className="group mb-2 inline-flex min-w-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs text-muted-foreground tabular-nums outline-none transition-colors hover:bg-foreground/[0.05] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/15 disabled:opacity-50"
        >
          <span className="truncate">invoice-{invoiceData.invoiceNumber}.pdf</span>
          <ArrowUpRight className="size-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </button>
      </div>

      <div className="relative mt-5 aspect-[210/297] w-full overflow-hidden rounded-[10px] bg-white shadow-sheet lg:aspect-auto lg:min-h-0 lg:flex-1">
        {/* The viewer is overscanned by a few pixels to hide its grey page margin, so the page reads as one white sheet */}
        {pdfBlob ? (
          <PDFViewer 
            key={pdfKey}
            showToolbar={false}
            className="absolute -top-[5px] -left-[5px] block h-[calc(100%+5px)] w-[calc(100%+10px)] max-w-none border-0"
            innerRef={(frame) => frame?.setAttribute('title', 'Invoice PDF preview')}
          >
            <InvoicePDF data={invoiceData} />
          </PDFViewer>
        ) : (
          <SheetPlaceholder />
        )}
      </div>
    </div>
  );
};

// Grey bars shown while the first PDF is being generated
const SheetPlaceholder = () => (
  <div aria-hidden="true" className="flex size-full animate-pulse flex-col gap-10 p-10">
    <div className="flex justify-between">
      <div className="h-5 w-48 rounded-full bg-neutral-200/80" />
      <div className="flex flex-col items-end gap-2">
        <div className="h-4 w-24 rounded-full bg-neutral-200/80" />
        <div className="h-2.5 w-32 rounded-full bg-neutral-100" />
        <div className="h-2.5 w-28 rounded-full bg-neutral-100" />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className="h-3 w-20 rounded-full bg-neutral-200/80" />
      <div className="h-2.5 w-40 rounded-full bg-neutral-100" />
      <div className="h-2.5 w-36 rounded-full bg-neutral-100" />
    </div>
    <div className="flex flex-col gap-3 border-t border-neutral-100 pt-6">
      <div className="h-2.5 w-full rounded-full bg-neutral-100" />
      <div className="h-2.5 w-full rounded-full bg-neutral-100" />
      <div className="h-2.5 w-2/3 rounded-full bg-neutral-100" />
    </div>
  </div>
);
