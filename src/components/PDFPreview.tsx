import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { ArrowUpRight } from 'lucide-react';
import { InvoicePDF } from './InvoicePDF';
import { Button } from '@/components/ui/button';
import type { InvoiceData } from '../types/invoice';

// Opens the same blob the Download button saves, in the browser's full PDF viewer
const openPDFInNewTab = (pdfBlob: Blob) => {
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
  // Give the new tab time to load the blob before releasing it
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

// On phones the preview sits below the whole form, so the PDF viewer waits until it scrolls near.
// Wider screens (and browsers without IntersectionObserver) mount it straight away.
const shouldMountEagerly = () =>
  typeof IntersectionObserver === 'undefined' || !window.matchMedia('(max-width: 767.98px)').matches;

interface PDFPreviewProps {
  invoiceData: InvoiceData;
  pdfBlob: Blob | null;
  // Extra controls at the right end of the tab row
  actions?: ReactNode;
}

export const PDFPreview = ({ invoiceData, pdfBlob, actions }: PDFPreviewProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(shouldMountEagerly);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (isNearViewport || !sheet) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [isNearViewport]);

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
      <div className="flex h-(--header-h) shrink-0 items-end justify-between gap-4 border-b border-foreground/[0.08]">
        <h2 className="relative pb-3 text-sm leading-5 font-medium">
          Preview
          <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[1.5px] rounded-full bg-foreground" />
        </h2>
        <div className="flex h-11 min-w-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => pdfBlob && openPDFInNewTab(pdfBlob)}
            disabled={!pdfBlob}
            title="Open the PDF in a new tab to zoom or print"
            className="group min-w-0 px-2.5 text-xs font-normal tabular-nums"
          >
            <span className="truncate">invoice-{invoiceData.invoiceNumber}.pdf</span>
            <ArrowUpRight className="size-3.5 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </Button>
          {actions}
        </div>
      </div>

      <div
        ref={sheetRef}
        className="relative mt-5 aspect-[210/297] w-full overflow-hidden rounded-[10px] bg-white shadow-sheet lg:aspect-auto lg:min-h-0 lg:flex-1"
      >
        {/* The viewer is overscanned by a few pixels to hide its grey page margin, so the page reads as one white sheet */}
        {pdfBlob && isNearViewport ? (
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

// Grey bars shown until the PDF is ready (and, on phones, until the sheet scrolls into view)
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
