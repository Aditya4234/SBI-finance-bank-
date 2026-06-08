import { addJob, getAllQueueMetrics, emailQueue, transactionQueue, auditQueue, notificationQueue, reportQueue, kycQueue, loanQueue } from '../queues';
import { EmailJobData, TransactionJobData, AuditJobData, NotificationJobData, ReportJobData, KycJobData, LoanJobData } from '../queues/jobTypes';

export class QueueService {
  async sendEmail(data: EmailJobData, delay?: number) {
    return addJob(emailQueue, data, { delay, priority: 2 });
  }

  async processTransaction(data: TransactionJobData, delay?: number) {
    return addJob(transactionQueue, data, { delay, priority: 1 });
  }

  async logAudit(data: AuditJobData) {
    return addJob(auditQueue, data, { priority: 3, attempts: 1 });
  }

  async sendNotification(data: NotificationJobData, delay?: number) {
    return addJob(notificationQueue, data, { delay, priority: 2 });
  }

  async generateReport(data: ReportJobData) {
    return addJob(reportQueue, data, { priority: 4 });
  }

  async processKyc(data: KycJobData) {
    return addJob(kycQueue, data, { priority: 2 });
  }

  async processLoan(data: LoanJobData, delay?: number) {
    return addJob(loanQueue, data, { delay, priority: 2 });
  }

  async getMetrics() {
    return getAllQueueMetrics();
  }

  async scheduleLoanEmiCollection() {
    return this.processLoan({ type: 'emi-collection' });
  }

  async checkLoanDefaults() {
    return this.processLoan({ type: 'default-check' });
  }
}

export const queueService = new QueueService();
