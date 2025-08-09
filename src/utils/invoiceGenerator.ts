import { faker } from '@faker-js/faker';
import { InvoiceData } from '../types/invoice';

export const generateFakeInvoice = (): InvoiceData => {
  const items = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const unitPrice = faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
    return {
      description: faker.commerce.productName(),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };
  });

  return {
    invoiceNumber: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
    issueDate: faker.date.recent({ days: 30 }).toLocaleDateString('en-GB'),
    dueDate: faker.date.soon({ days: 30 }).toLocaleDateString('en-GB'),
    companyName: faker.company.name(),
    companyAddress: faker.location.streetAddress(true),
    companyPhone: faker.phone.number(),
    companyEmail: faker.internet.email(),
    companyVatNumber: `GB${faker.number.int({ min: 100000000, max: 999999999 })}`,
    clientName: faker.person.fullName(),
    clientAddress: faker.location.streetAddress(true),
    clientEmail: faker.internet.email(),
    sortCode: `${faker.number.int({ min: 10, max: 99 })}-${faker.number.int({ min: 10, max: 99 })}-${faker.number.int({ min: 10, max: 99 })}`,
    accountNumber: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
    items,
  };
};
