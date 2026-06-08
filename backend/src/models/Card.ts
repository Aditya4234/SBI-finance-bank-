export enum CardType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum CardStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface ICard {
  id: string;
  userId: string;
  accountId?: string;
  cardNumber: string;
  cardType: CardType;
  status: CardStatus;
  cardHolderName: string;
  expiryDate: Date;
  cvv: string;
  cardNetwork: string;
  dailyLimit: number;
  monthlyLimit: number;
  domesticLimit: number;
  internationalLimit: number;
  isInternationalEnabled: boolean;
  isContactlessEnabled: boolean;
  pinSet: boolean;
  creditLimit?: number;
  availableCredit?: number;
  outstandingAmount?: number;
  billingDate?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
