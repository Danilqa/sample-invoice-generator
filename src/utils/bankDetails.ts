import { faker } from '@faker-js/faker';

export interface BankDetails {
  name: string;
  sortCode: string;
  accountNumber: string;
}

export const charityBankDetails: BankDetails[] = [
  {
    name: "British Heart Foundation (BHF)",
    sortCode: "20-03-53",
    accountNumber: "90845388"
  },
  {
    name: "Islamic Relief UK",
    sortCode: "20-07-71",
    accountNumber: "10966177"
  },
  {
    name: "Right to Life Charitable Trust",
    sortCode: "40-52-40",
    accountNumber: "00013088"
  },
  {
    name: "Hope After Harm (Thames Valley Partnership)",
    sortCode: "20-85-73",
    accountNumber: "30726133"
  },
  {
    name: "Groundwork (GVA Charity)",
    sortCode: "60-02-35",
    accountNumber: "67387640"
  },
  {
    name: "MWL NHS Charity",
    sortCode: "60-70-80",
    accountNumber: "10003274"
  },
  {
    name: "Doctors for Nepal (Brighton)",
    sortCode: "30-91-25",
    accountNumber: "00284204"
  },
  {
    name: "Friends of NAS UK",
    sortCode: "60-13-15",
    accountNumber: "44894074"
  },
  {
    name: "Withy Trees Welfare & Education",
    sortCode: "16-20-16",
    accountNumber: "10256436"
  },
  {
    name: "The Kvell Project",
    sortCode: "30-94-35",
    accountNumber: "12782160"
  },
  {
    name: "Friends of Earls Hall Schools",
    sortCode: "30-97-84",
    accountNumber: "00325889"
  },
  {
    name: "Lighthouse Gospel Ministries",
    sortCode: "20-66-51",
    accountNumber: "43228118"
  }
];

export const generateRandomInvalidBankDetails = (): BankDetails => {
  const randomSortCode = `${Math.floor(Math.random() * 99).toString().padStart(2, '0')}-${Math.floor(Math.random() * 99).toString().padStart(2, '0')}-${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`;
  const randomAccountNumber = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
  
  return {
    name: faker.company.name(),
    sortCode: randomSortCode,
    accountNumber: randomAccountNumber
  };
};
