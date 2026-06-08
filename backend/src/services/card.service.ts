import { AppError, NotFoundError } from '../utils/errors';
import { generateCardNumber, generateCvv, generateExpiryDate } from '../utils/helpers';
import { getPersonalDb } from '../config/personal-db';

export class CardService {
  async issueDebitCard(userId: string, accountId: string, cardNetwork = 'VISA') {
    const db = getPersonalDb();

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const account = await db.personalAccount.findFirst({
      where: { id: accountId, userId, status: { not: 'CLOSED' as any } },
    });
    if (!account) throw new NotFoundError('Account');

    if (account.debitCardId) {
      throw new AppError('This account already has a debit card', 409);
    }

    const cardNumber = generateCardNumber(cardNetwork);
    const cvv = generateCvv();
    const expiryDate = generateExpiryDate();

    const card = await db.card.create({
      data: {
        userId,
        accountId,
        cardNumber,
        cardType: 'DEBIT' as any,
        status: 'ACTIVE' as any,
        cardHolderName: user.fullName,
        expiryDate,
        cvv,
        cardNetwork,
      },
    });

    await db.personalAccount.update({
      where: { id: accountId },
      data: { debitCardId: card.id },
    });

    const { cvv: _cvv, ...cardWithoutCvv } = card;
    return cardWithoutCvv;
  }

  async issueCreditCard(userId: string, cardData: {
    cardNetwork: string;
    creditLimit: number;
    annualIncome?: number;
  }) {
    const db = getPersonalDb();

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const cardNumber = generateCardNumber(cardData.cardNetwork);
    const cvv = generateCvv();
    const expiryDate = generateExpiryDate();

    const card = await db.card.create({
      data: {
        userId,
        cardNumber,
        cardType: 'CREDIT' as any,
        status: 'ACTIVE' as any,
        cardHolderName: user.fullName,
        expiryDate,
        cvv,
        cardNetwork: cardData.cardNetwork,
        creditLimit: cardData.creditLimit,
        availableCredit: cardData.creditLimit,
        outstandingAmount: 0,
      },
    });

    const { cvv: _cvv, ...cardWithoutCvv } = card;
    return cardWithoutCvv;
  }

  async getUserCards(userId: string) {
    const db = getPersonalDb();
    return db.card.findMany({
      where: { userId, status: { not: 'CANCELLED' as any } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCardById(cardId: string, userId: string) {
    const db = getPersonalDb();
    const card = await db.card.findFirst({
      where: { id: cardId, userId },
    });
    if (!card) throw new NotFoundError('Card');
    return card;
  }

  async blockCard(cardId: string, userId: string, reason?: string) {
    const db = getPersonalDb();
    await this.getCardById(cardId, userId);
    return db.card.update({
      where: { id: cardId },
      data: { status: 'BLOCKED' as any },
    });
  }

  async unblockCard(cardId: string, userId: string) {
    const db = getPersonalDb();
    await this.getCardById(cardId, userId);
    return db.card.update({
      where: { id: cardId },
      data: { status: 'ACTIVE' as any },
    });
  }

  async setCardLimit(cardId: string, userId: string, limits: {
    dailyLimit?: number;
    monthlyLimit?: number;
    domesticLimit?: number;
    internationalLimit?: number;
  }) {
    const db = getPersonalDb();
    await this.getCardById(cardId, userId);
    return db.card.update({
      where: { id: cardId },
      data: limits,
    });
  }

  async toggleInternational(cardId: string, userId: string) {
    const db = getPersonalDb();
    const card = await this.getCardById(cardId, userId);
    return db.card.update({
      where: { id: cardId },
      data: { isInternationalEnabled: !card.isInternationalEnabled },
    });
  }

  async toggleContactless(cardId: string, userId: string) {
    const db = getPersonalDb();
    const card = await this.getCardById(cardId, userId);
    return db.card.update({
      where: { id: cardId },
      data: { isContactlessEnabled: !card.isContactlessEnabled },
    });
  }

  async setPin(cardId: string, userId: string) {
    const db = getPersonalDb();
    await this.getCardById(cardId, userId);
    return db.card.update({
      where: { id: cardId },
      data: { pinSet: true },
    });
  }

  async cancelCard(cardId: string, userId: string) {
    const db = getPersonalDb();
    const card = await this.getCardById(cardId, userId);

    const updated = await db.card.update({
      where: { id: cardId },
      data: { status: 'CANCELLED' as any },
    });

    if (card.accountId) {
      const account = await db.personalAccount.findUnique({ where: { id: card.accountId } });
      if (account && account.debitCardId === card.id) {
        await db.personalAccount.update({
          where: { id: card.accountId },
          data: { debitCardId: null },
        });
      }
    }

    return updated;
  }
}

export const cardService = new CardService();
