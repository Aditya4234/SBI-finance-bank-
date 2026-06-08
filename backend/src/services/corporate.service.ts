import { AppError, NotFoundError } from '../utils/errors';
import { getPersonalDb } from '../config/personal-db';
import { UserRole } from '../models/User';

export class CorporateService {
  async createCompany(adminId: string, companyData: {
    companyName: string;
    cinNumber: string;
    gstNumber: string;
    panNumber: string;
    businessType: string;
    registeredAddress: any;
    authorizedSignatory: any;
  }) {
    const corpDb = (await import('../config/corporate-db')).getCorporateDb();

    const existingCompany = await corpDb.company.findFirst({
      where: {
        OR: [
          { cinNumber: companyData.cinNumber },
          { gstNumber: companyData.gstNumber },
          { panNumber: companyData.panNumber },
        ],
      },
    });

    if (existingCompany) {
      throw new AppError('Company already registered with provided CIN/GST/PAN', 409);
    }

    const company = await corpDb.company.create({
      data: {
        companyName: companyData.companyName,
        cinNumber: companyData.cinNumber,
        gstNumber: companyData.gstNumber,
        panNumber: companyData.panNumber,
        businessType: companyData.businessType,
        registeredAddress: companyData.registeredAddress,
        authorizedSignatory: companyData.authorizedSignatory,
        adminId,
        employees: [adminId],
      },
    });

    const db = getPersonalDb();
    await db.user.update({
      where: { id: adminId },
      data: {
        role: 'CORPORATE_ADMIN' as any,
        companyId: company.id,
      },
    });

    return company;
  }

  async addEmployee(companyId: string, employeeData: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    role: string;
  }) {
    const corpDb = (await import('../config/corporate-db')).getCorporateDb();
    const company = await corpDb.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundError('Company');

    const db = getPersonalDb();
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: employeeData.email }, { mobile: employeeData.mobile }],
      },
    });

    if (existingUser) {
      throw new AppError('Employee already registered', 409);
    }

    const { hashPassword } = await import('../models/User');
    const hashed = await hashPassword(employeeData.password);

    const employee = await db.user.create({
      data: {
        fullName: employeeData.fullName,
        email: employeeData.email,
        mobile: employeeData.mobile,
        password: hashed,
        role: employeeData.role as any,
        companyId,
        isVerified: true,
      },
    });

    const employees = [...company.employees, employee.id];
    await corpDb.company.update({
      where: { id: companyId },
      data: { employees },
    });

    return employee;
  }

  async getCompany(companyId: string) {
    const corpDb = (await import('../config/corporate-db')).getCorporateDb();
    const company = await corpDb.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundError('Company');

    const db = getPersonalDb();
    const admin = await db.user.findUnique({
      where: { id: company.adminId },
      select: { fullName: true, email: true, mobile: true },
    });

    const employees = await db.user.findMany({
      where: { id: { in: company.employees } },
      select: { fullName: true, email: true, mobile: true, role: true },
    });

    return { ...company, adminId: admin, employees };
  }

  async getCompanyByUser(userId: string) {
    const db = getPersonalDb();
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.companyId) throw new NotFoundError('Company not found for user');
    return this.getCompany(user.companyId);
  }

  async processSalary(
    companyId: string,
    fromAccount: string,
    salaries: Array<{ employeeId: string; amount: number; description?: string }>
  ) {
    if (!salaries.length) throw new AppError('No salary entries provided', 400);
    for (const s of salaries) {
      if (s.amount <= 0) throw new AppError(`Invalid salary amount for employee ${s.employeeId}`, 400);
    }

    const corpDb = (await import('../config/corporate-db')).getCorporateDb();
    const db = getPersonalDb();

    const company = await corpDb.company.findUnique({
      where: { id: companyId },
      select: { id: true, adminId: true, employees: true },
    });
    if (!company) throw new NotFoundError('Company');

    const account = await corpDb.corporateAccount.findFirst({
      where: { companyId, accountNumber: fromAccount, status: 'active' },
    });
    if (!account) throw new NotFoundError('Corporate account');

    const totalSalary = salaries.reduce((sum, s) => sum + s.amount, 0);
    if (account.balance < totalSalary) {
      throw new AppError('Insufficient balance in corporate account', 400);
    }

    const results: Array<{ employeeId: string; status: string; transactionId?: string; error?: string }> = [];

    for (const salary of salaries) {
      if (!company.employees.includes(salary.employeeId)) {
        results.push({ employeeId: salary.employeeId, status: 'failed', error: 'Not an employee of this company' });
        continue;
      }

      try {
        const employeeAccount = await db.personalAccount.findFirst({
          where: { userId: salary.employeeId, status: 'ACTIVE' },
        });
        if (!employeeAccount) {
          results.push({ employeeId: salary.employeeId, status: 'failed', error: 'No active personal account' });
          continue;
        }

        const transactionId = `SAL-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        await db.personalAccount.update({
          where: { id: employeeAccount.id },
          data: { balance: { increment: salary.amount } },
        });

        await db.transaction.create({
          data: {
            transactionId,
            userId: salary.employeeId,
            companyId,
            fromAccount,
            toAccount: employeeAccount.accountNumber,
            toName: 'Salary Credit',
            amount: salary.amount,
            transactionType: 'SALARY',
            status: 'SUCCESS',
            description: salary.description || 'Salary payment',
            balanceBefore: employeeAccount.balance,
            balanceAfter: employeeAccount.balance + salary.amount,
            paymentDate: new Date(),
            processedDate: new Date(),
          },
        });

        const corpTxId = `CRPSAL-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        await corpDb.corporateTransaction.create({
          data: {
            transactionId: corpTxId,
            companyId,
            fromAccount,
            toAccount: employeeAccount.accountNumber,
            toName: 'Salary Payment',
            amount: salary.amount,
            transactionType: 'SALARY',
            status: 'SUCCESS',
            description: salary.description || 'Salary payment',
            paymentDate: new Date(),
            processedDate: new Date(),
          },
        });

        results.push({ employeeId: salary.employeeId, status: 'success', transactionId });
      } catch (error: any) {
        results.push({ employeeId: salary.employeeId, status: 'failed', error: error.message });
      }
    }

    const successfulCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    await corpDb.corporateAccount.update({
      where: { id: account.id },
      data: { balance: { decrement: successfulCount > 0 ? salaries.filter(s => results.find(r => r.employeeId === s.employeeId && r.status === 'success')).reduce((sum, s) => sum + s.amount, 0) : 0 } },
    });

    return {
      totalSalary,
      employeeCount: salaries.length,
      successful: successfulCount,
      failed: failedCount,
      details: results,
    };
  }
}

export const corporateService = new CorporateService();
