import { faker } from '@faker-js/faker';
import type { InvoiceData } from '../types/invoice';
import { getBankDetailsByCurrency } from './bankDetails';

export const generateFakeInvoice = (currency: 'GBP' | 'EUR' | 'USD' = 'GBP'): InvoiceData => {
  const items = Array.from({ length: 2 }, () => {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const unitPrice = faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
    return {
      description: faker.commerce.productName(),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };
  });

  const bankDetails = getBankDetailsByCurrency(currency);
  const defaultBank = bankDetails[0];

  return {
    invoiceNumber: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
    issueDate: faker.date.recent({ days: 30 }).toLocaleDateString('en-GB'),
    dueDate: faker.date.soon({ days: 30 }).toLocaleDateString('en-GB'),
    companyName: defaultBank.name,
    companyAddress: faker.location.streetAddress(true),
    companyPhone: faker.phone.number(),
    companyEmail: faker.internet.email(),
    companyVatNumber: `GB${faker.number.int({ min: 100000000, max: 999999999 })}`,
    clientName: faker.person.fullName(),
    clientAddress: faker.location.streetAddress(true),
    clientEmail: faker.internet.email(),
    sortCode: defaultBank.sortCode || '',
    accountNumber: defaultBank.accountNumber || '',
    accountName: defaultBank.name,
    iban: defaultBank.iban || '',
    swiftBic: defaultBank.swiftBic || '',
    currency,
    items,
  };
};
