import { faker } from '@faker-js/faker';

export interface BankDetails {
  name: string;
  sortCode?: string;
  accountNumber?: string;
  iban?: string;
  currency: 'GBP' | 'EUR';
}

export const gbpBankDetails: BankDetails[] = [
  {
    name: "British Heart Foundation (BHF)",
    sortCode: "20-03-53",
    accountNumber: "90845388",
    currency: "GBP"
  },
  {
    name: "Islamic Relief UK",
    sortCode: "20-07-71",
    accountNumber: "10966177",
    currency: "GBP"
  },
  {
    name: "Right to Life Charitable Trust",
    sortCode: "40-52-40",
    accountNumber: "00013088",
    currency: "GBP"
  },
  {
    name: "Hope After Harm (Thames Valley Partnership)",
    sortCode: "20-85-73",
    accountNumber: "30726133",
    currency: "GBP"
  },
  {
    name: "Groundwork (GVA Charity)",
    sortCode: "60-02-35",
    accountNumber: "67387640",
    currency: "GBP"
  },
  {
    name: "MWL NHS Charity",
    sortCode: "60-70-80",
    accountNumber: "10003274",
    currency: "GBP"
  },
  {
    name: "Doctors for Nepal (Brighton)",
    sortCode: "30-91-25",
    accountNumber: "00284204",
    currency: "GBP"
  },
  {
    name: "Friends of NAS UK",
    sortCode: "60-13-15",
    accountNumber: "44894074",
    currency: "GBP"
  },
  {
    name: "Withy Trees Welfare & Education",
    sortCode: "16-20-16",
    accountNumber: "10256436",
    currency: "GBP"
  },
  {
    name: "The Kvell Project",
    sortCode: "30-94-35",
    accountNumber: "12782160",
    currency: "GBP"
  },
  {
    name: "Friends of Earls Hall Schools",
    sortCode: "30-97-84",
    accountNumber: "00325889",
    currency: "GBP"
  },
  {
    name: "Lighthouse Gospel Ministries",
    sortCode: "20-66-51",
    accountNumber: "43228118",
    currency: "GBP"
  }
];

export const eurBankDetails: BankDetails[] = [
  {
    name: "Alliance for Middle East Peace",
    iban: "FR76 3000 4005 7500 0102 2446 410",
    currency: "EUR"
  },
  {
    name: "Islamic Relief UK",
    iban: "GB27 BARC 2007 7175 7517 55",
    currency: "EUR"
  },
  {
    name: "Palestine Red Crescent Society",
    iban: "PS23PALS047106073770333000000",
    currency: "EUR"
  },
  {
    name: "EuroNatur",
    iban: "DE53 3702 0500 0008 1820 01",
    currency: "EUR"
  },
  {
    name: "Myriad Europe",
    iban: "BE10 0000 0000 0404",
    currency: "EUR"
  },
  {
    name: "Stiftung Gebäudeensemble Joachimsthalsches Gymnasium Templin",
    iban: "DE83 1509 1704 3021 2409 57",
    currency: "EUR"
  }
];

export const getBankDetailsByCurrency = (currency: 'GBP' | 'EUR'): BankDetails[] => {
  switch (currency) {
    case 'EUR':
      return eurBankDetails;
    case 'GBP':
    default:
      return gbpBankDetails;
  }
};

export const generateRandomInvalidBankDetails = (currency: 'GBP' | 'EUR' = 'GBP'): BankDetails => {
  switch (currency) {
    case 'EUR': {
      // Generate random IBAN for EUR with more realistic format
      const countryCode = ['DE', 'FR', 'BE', 'NL', 'AT', 'IT', 'ES'][Math.floor(Math.random() * 7)];
      const checkDigits = Math.floor(Math.random() * 99).toString().padStart(2, '0');
      
      // Generate bank code and account number based on country
      let bankCode, accountNumber;
      switch (countryCode) {
        case 'DE': { // Germany: 8 digits bank code + 10 digits account {
          bankCode = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
          accountNumber = Math.floor(Math.random() * 9999999999).toString().padStart(10, '0');
          break;
        }
        case 'FR': { // France: 5 digits bank code + 5 digits branch + 11 digits account
          bankCode = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
          const branchCode = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
          accountNumber = Math.floor(Math.random() * 99999999999).toString().padStart(11, '0');
          bankCode = bankCode + branchCode;
          break;
        }
        case 'BE': { // Belgium: 3 digits bank code + 7 digits account
          bankCode = Math.floor(Math.random() * 999).toString().padStart(3, '0');
          accountNumber = Math.floor(Math.random() * 9999999).toString().padStart(7, '0');
          break;
        }
        case 'NL': { // Netherlands: 4 digits bank code + 10 digits account
          bankCode = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
          accountNumber = Math.floor(Math.random() * 9999999999).toString().padStart(10, '0');
          break;
        }
        case 'AT': { // Austria: 5 digits bank code + 11 digits account
          bankCode = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
          accountNumber = Math.floor(Math.random() * 99999999999).toString().padStart(11, '0');
          break;
        }
        case 'IT': { // Italy: 1 letter + 3 digits bank code + 1 letter + 15 digits account
          const bankLetter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
          const bankDigits = Math.floor(Math.random() * 999).toString().padStart(3, '0');
          const bankLetter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
          bankCode = bankLetter1 + bankDigits + bankLetter2;
          accountNumber = Math.floor(Math.random() * 999999999999999).toString().padStart(15, '0');
          break;
        }
        case 'ES': {// Spain: 4 digits bank code + 4 digits branch + 2 digits check + 10 digits account
          bankCode = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
          const branchCode = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
          const checkCode = Math.floor(Math.random() * 99).toString().padStart(2, '0');
          accountNumber = Math.floor(Math.random() * 9999999999).toString().padStart(10, '0');
          bankCode = bankCode + branchCode + checkCode;
          break;
        }
        default:
          bankCode = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
          accountNumber = Math.floor(Math.random() * 9999999999).toString().padStart(10, '0');
      }
      
      const randomIBAN = `${countryCode}${checkDigits} ${bankCode} ${accountNumber}`;
      
      return {
        name: faker.company.name(),
        iban: randomIBAN,
        currency: 'EUR'
      };
    }
    case 'GBP':
    default: {
      // Generate random sort code and account number for GBP
      const randomSortCode = `${Math.floor(Math.random() * 99).toString().padStart(2, '0')}-${Math.floor(Math.random() * 99).toString().padStart(2, '0')}-${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`;
      const randomAccountNumber = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
      
      return {
        name: faker.company.name(),
        sortCode: randomSortCode,
        accountNumber: randomAccountNumber,
        currency: 'GBP'
      };
    }
  }
};
