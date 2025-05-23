// ClickSend SMS Service Integration
// Docs: https://developers.clicksend.com/docs/rest/v3/

interface ClickSendConfig {
  username: string;
  apiKey: string;
  baseUrl: string;
}

interface SMSMessage {
  to: string;
  body: string;
  from?: string;
  source?: string;
}

interface ContactListContact {
  phone_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  custom_1?: string; // user_id
  custom_2?: string; // opt_in_date
}

interface ClickSendResponse {
  http_code: number;
  response_code: string;
  response_msg: string;
  data?: any;
}

class ClickSendService {
  private config: ClickSendConfig;
  private contactListId: number;

  constructor() {
    this.config = {
      username: process.env.CLICKSEND_USERNAME || '',
      apiKey: process.env.CLICKSEND_API_KEY || '',
      baseUrl: 'https://rest.clicksend.com/v3'
    };
    this.contactListId = parseInt(process.env.CLICKSEND_CONTACT_LIST_ID || '0');
  }

  private getAuthHeader(): string {
    const credentials = btoa(`${this.config.username}:${this.config.apiKey}`);
    return `Basic ${credentials}`;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<ClickSendResponse> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      return {
        http_code: response.status,
        response_code: result.response_code || 'SUCCESS',
        response_msg: result.response_msg || 'Request completed',
        data: result.data
      };
    } catch (error) {
      console.error('ClickSend API Error:', error);
      throw new Error(`ClickSend API request failed: ${error}`);
    }
  }

  // Send SMS to single recipient
  async sendSMS(message: SMSMessage): Promise<ClickSendResponse> {
    const smsData = {
      messages: [
        {
          to: message.to,
          body: message.body,
          from: message.from || 'EquityMD',
          source: message.source || 'api'
        }
      ]
    };

    return this.makeRequest('/sms/send', 'POST', smsData);
  }

  // Send SMS to multiple recipients
  async sendBulkSMS(messages: SMSMessage[]): Promise<ClickSendResponse> {
    const smsData = {
      messages: messages.map(msg => ({
        to: msg.to,
        body: msg.body,
        from: msg.from || 'EquityMD',
        source: msg.source || 'api'
      }))
    };

    return this.makeRequest('/sms/send', 'POST', smsData);
  }

  // Add contact to contact list
  async addContact(contact: ContactListContact): Promise<ClickSendResponse> {
    const contactData = {
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      phone_number: contact.phone_number,
      email: contact.email || '',
      custom_1: contact.custom_1 || '', // user_id
      custom_2: contact.custom_2 || '', // opt_in_date
    };

    return this.makeRequest(`/lists/${this.contactListId}/contacts`, 'POST', contactData);
  }

  // Remove contact from contact list
  async removeContact(phoneNumber: string): Promise<ClickSendResponse> {
    // First, find the contact by phone number
    const contacts = await this.getContacts();
    const contact = contacts.data?.data?.find((c: any) => c.phone_number === phoneNumber);
    
    if (!contact) {
      return {
        http_code: 404,
        response_code: 'NOT_FOUND',
        response_msg: 'Contact not found'
      };
    }

    return this.makeRequest(`/lists/${this.contactListId}/contacts/${contact.contact_id}`, 'DELETE');
  }

  // Get all contacts from contact list
  async getContacts(): Promise<ClickSendResponse> {
    return this.makeRequest(`/lists/${this.contactListId}/contacts`);
  }

  // Send SMS to entire contact list
  async sendToContactList(message: string, listId?: number): Promise<ClickSendResponse> {
    const targetListId = listId || this.contactListId;
    
    const smsData = {
      list_id: targetListId,
      body: message,
      from: 'EquityMD',
      source: 'api'
    };

    return this.makeRequest('/sms/send', 'POST', smsData);
  }

  // Get account balance
  async getBalance(): Promise<ClickSendResponse> {
    return this.makeRequest('/account');
  }

  // Get SMS delivery reports
  async getDeliveryReports(): Promise<ClickSendResponse> {
    return this.makeRequest('/sms/receipts');
  }

  // Validate phone number format
  static validatePhoneNumber(phoneNumber: string): boolean {
    // US format: +1-XXX-XXX-XXXX
    const phoneRegex = /^\+1-\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Format phone number to ClickSend format
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 1, assume US number
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // If 10 digits, add US country code
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    return phoneNumber; // Return as-is if can't format
  }

  // Calculate SMS cost (approximate)
  static calculateSMSCost(message: string, recipientCount: number = 1): number {
    const messageLength = message.length;
    const smsCount = Math.ceil(messageLength / 160); // SMS is 160 chars max
    const costPerSMS = 0.05; // $0.05 per SMS (approximate ClickSend pricing)
    
    return smsCount * recipientCount * costPerSMS;
  }
}

// Export singleton instance
export const clickSendService = new ClickSendService();

// Export types
export type { SMSMessage, ContactListContact, ClickSendResponse };

// Export utility functions
export const { validatePhoneNumber, formatPhoneNumber, calculateSMSCost } = ClickSendService; 