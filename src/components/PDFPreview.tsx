import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { ArrowUpRight } from 'lucide-react';
import { InvoicePDF } from './InvoicePDF';
import { Button } from '@/components/ui/button';
import type { InvoiceData } from '../types/invoice';

// One object URL per PDF, kept while the app is open (the browser releases them all when it closes),
// so a tab opened from here can still be reloaded later
const pdfUrls = new WeakMap<Blob, string>();

// Opens the same blob the Download button saves, in the browser's full PDF viewer
const openPDFInNewTab = (pdfBlob: Blob) => {
  let url = pdfUrls.get(pdfBlob);
  if (!url) {
    url = URL.createObjectURL(pdfBlob);
    pdfUrls.set(pdfBlob, url);
  }
  window.open(url, '_blank');
};

// How long after a Tab keypress focus may take to arrive in the viewer (it's handed over between processes;
// a few milliseconds in practice)
const TAB_FOCUS_WINDOW_MS = 1000;

// Whether keyboard focus is inside the iframe in `ref`'s element. Used for the PDF viewer: once it has focus
// the arrow keys scroll the page, but Chrome never matches :focus, :focus-visible or :focus-within for it,
// so CSS can't draw its focus ring. Only Tab turns this on; clicking into the viewer doesn't.
const useKeyboardFocusInFrame = (ref: RefObject<HTMLElement | null>) => {
  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    let lastTabAt = -Infinity;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') lastTabAt = event.timeStamp;
    };
    // The page's window blurs when focus moves into the iframe, by Tab or by a click inside it
    const handleWindowBlur = (event: FocusEvent) => {
      const viaTab = event.timeStamp - lastTabAt < TAB_FOCUS_WINDOW_MS;
      lastTabAt = -Infinity;
      if (viaTab && ref.current?.contains(document.activeElement)) setHasFocus(true);
    };
    // Focus coming back to the page (Tab out of the viewer, or a click elsewhere), or landing on a page element
    const handleFocusBack = () => {
      lastTabAt = -Infinity;
      if (!ref.current?.contains(document.activeElement)) setHasFocus(false);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleFocusBack);
    document.addEventListener('focusin', handleFocusBack);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleFocusBack);
      document.removeEventListener('focusin', handleFocusBack);
    };
  }, [ref]);

  return hasFocus;
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
  const hasKeyboardFocus = useKeyboardFocusInFrame(sheetRef);

  // PDFViewer renders the PDF again (and reloads its iframe, dropping focus) whenever it gets a new
  // document element, so only make one when the invoice data changes, not on every render
  const pdfDocument = useMemo(() => <InvoicePDF data={invoiceData} />, [invoiceData]);

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
        data-keyboard-focus={hasKeyboardFocus || undefined}
        className="relative mt-5 aspect-[210/297] w-full overflow-hidden rounded-[10px] bg-white shadow-sheet data-keyboard-focus:outline-2 data-keyboard-focus:outline-offset-4 lg:aspect-auto lg:min-h-0 lg:flex-1"
      >
        {/* The viewer is overscanned to hide the dark margin it draws around the page, so the page reads as
            one white sheet even when scrolled to its end: 5px is cut off at the top, left and right, and 8px
            at the bottom (the margin below the page is 7px at full size) */}
        {pdfBlob && isNearViewport ? (
          <PDFViewer
            key={pdfKey}
            showToolbar={false}
            className="absolute -top-[5px] -left-[5px] block h-[calc(100%+13px)] w-[calc(100%+10px)] max-w-none border-0"
            innerRef={(frame) => frame?.setAttribute('title', 'Invoice PDF preview')}
          >
            {pdfDocument}
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
