
import { CustomerRegistrationData, RegistrationData } from './types';

// In-memory database for the prototype
class BharosaDatabase {
  private customers: CustomerRegistrationData[] = [
    {
      name: 'Conference Carl',
      phone: '9876543210',
      fingerprintVerified: true,
      faceVerified: true,
      customerId: 'BH-CUST-PROTOTYPE',
      fingerprintHash: 'fp-8888',
      faceHash: 'face-8888'
    }
  ];

  private shopkeepers: RegistrationData[] = [
    {
      ownerName: 'Verma Ji',
      aadhaar: '123412341234',
      phone: '8888888888',
      panName: 'VERMA JI',
      dob: '1980-01-01',
      panNumber: 'ABCDE1234F',
      income: '8+',
      fingerprintVerified: true,
      faceVerified: true,
      shopkeeperId: 'S-8821',
      alphanumericId: 'VERMA8821',
      fingerprintHash: 'fp-v88',
      faceHash: 'face-v88'
    }
  ];

  // Customer methods
  getCustomers() {
    return this.customers;
  }

  addCustomer(customer: CustomerRegistrationData) {
    this.customers.push(customer);
  }

  findCustomerById(id: string) {
    return this.customers.find(c => c.customerId === id);
  }

  findCustomerByIdentity(fingerprint?: string, face?: string) {
    return this.customers.find(c => 
      (fingerprint && c.fingerprintHash === fingerprint) || 
      (face && c.faceHash === face)
    );
  }

  // Shopkeeper methods
  getShopkeepers() {
    return this.shopkeepers;
  }

  addShopkeeper(shopkeeper: RegistrationData) {
    this.shopkeepers.push(shopkeeper);
  }

  findShopkeeperById(id: string) {
    return this.shopkeepers.find(s => s.shopkeeperId === id || s.alphanumericId === id);
  }

  findShopkeeperByIdentity(pan?: string, fingerprint?: string, face?: string) {
    return this.shopkeepers.find(s => 
      (pan && s.panNumber === pan) || 
      (fingerprint && s.fingerprintHash === fingerprint) || 
      (face && s.faceHash === face)
    );
  }
}

export const db = new BharosaDatabase();
