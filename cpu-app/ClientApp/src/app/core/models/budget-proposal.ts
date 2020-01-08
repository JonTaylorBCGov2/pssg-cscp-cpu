import { iPerson } from './person.interface';
import { iRevenueSource } from './revenue-source.interface';
import { iExpenseItem } from './expense-item.interface';

export interface iBudgetProposal {
  organizationId: string;
  contractId: string;
  programs: iProgramBudget[];
  formState: string; // untouched	incomplete	invalid	complete info
}
export interface iProgramBudget {
  contractId: string;
  programId: string;
  name: string;
  type: string;
  formState: string; // untouched	incomplete	invalid	complete info
  email: string;
  revenueSources: iRevenueSource[];
  salariesAndBenefits: iPerson[];
  programDeliveryCosts: iExpenseItem[];
  programDeliveryMemberships: iExpenseItem[];
  programDeliveryOtherExpenses: iExpenseItem[];
  administrationCosts: iExpenseItem[];
  administrationOtherExpenses: iExpenseItem[];
}



