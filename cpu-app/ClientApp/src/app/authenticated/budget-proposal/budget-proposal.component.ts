import { ActivatedRoute, Router } from '@angular/router';
import { BudgetProposalService } from '../../core/services/budget-proposal.service';
import { Component, OnInit } from '@angular/core';
import { NotificationQueueService } from '../../core/services/notification-queue.service';
import { StateService } from '../../core/services/state.service';
import { TransmogrifierBudgetProposal } from '../../core/models/transmogrifier-budget-proposal.class';
import { iDynamicsBudgetProposal } from '../../core/models/dynamics-blob';
import { iStepperElement, IconStepperService } from '../../shared/icon-stepper/icon-stepper.service';
import { nameAssemble } from '../../core/constants/name-assemble';
import { convertBudgetProposalToDynamics } from '../../core/models/converters/budget-proposal-to-dynamics';
import { iProgramBudget } from '../../core/models/program-budget.interface';
import { iDynamicsPostBudgetProposal } from '../../core/models/dynamics-post';
import { FormHelper } from '../../core/form-helper';
import { Transmogrifier } from '../../core/models/transmogrifier.class';

@Component({
  selector: 'app-budget-proposal',
  templateUrl: './budget-proposal.component.html',
  styleUrls: ['./budget-proposal.component.css']
})
export class BudgetProposalComponent implements OnInit {
  // used for the stepper component
  currentStepperElement: iStepperElement;
  stepperElements: iStepperElement[];
  stepperIndex: number = 0;

  mainTrans: Transmogrifier;
  contractNumber: string;
  trans: TransmogrifierBudgetProposal;
  data: iDynamicsBudgetProposal;
  out: iDynamicsPostBudgetProposal;
  saving: boolean = false;

  personDict: object = {};
  private formHelper = new FormHelper();
  constructor(
    private budgetProposalService: BudgetProposalService,
    private notificationQueueService: NotificationQueueService,
    private route: ActivatedRoute,
    private router: Router,
    private stateService: StateService,
    private stepperService: IconStepperService,
  ) { }

  ngOnInit() {
    this.stateService.main.subscribe((m: Transmogrifier) => {
      // save the transmogrifier
      this.mainTrans = m;
    });
    // make a dictionary of names
    this.personDict = this.stateService.main.getValue().persons
      .map(p => {
        const tmp = {};
        tmp[p.personId] = nameAssemble(p.firstName, p.middleName, p.lastName);
        return tmp;
      })
      .reduce((prev, curr) => {
        return { ...prev, ...curr }
      });
    // collect the correct budget proposal
    this.route.params.subscribe(p => {
      // collect the current user information from the state.
      const userId: string = this.stateService.main.getValue().userId;
      const organizationId: string = this.stateService.main.getValue().organizationId;

      // get the budget proposal from the budget proposal service.
      this.budgetProposalService.getBudgetProposal(organizationId, userId, p['taskId']).subscribe(d => {
        if (!d.IsSuccess) {
          this.data = d;
          // notify the user of a system error
          this.notificationQueueService.addNotification('An attempt at getting this budget proposal form was unsuccessful. If the problem persists please notify your ministry contact.', 'danger');
          console.log(`IsSuccess was returned false when attempting to get Organization:${organizationId} User:${userId} Task:${p['taskId']} from the budget proposal API on OpenShift. The most likely cause is that the Dynamics data has changed, the Dynamics API has a bug, or the mapping of data requires modification to accomodate a change.`);

          // route back to the dashboard
          this.router.navigate(['/authenticated/dashboard']);
        } else {
          this.data = d;
          // make the transmogrifier for this form
          this.trans = new TransmogrifierBudgetProposal(d);
          this.trans.programBudgets = this.trans.programBudgets.map((pb: iProgramBudget): iProgramBudget => {
            // if there is nothing existing add some collectors so that the user sees more than a blank list
            // this is a problem because if these are unchanged by the user it prevents form submission.
            // if (!pb.salariesAndBenefits.length) { pb.salariesAndBenefits.push(new SalaryAndBenefits()); }
            // if (!pb.programDeliveryOtherExpenses.length) { pb.programDeliveryOtherExpenses.push(new ExpenseItem()); }
            // if (!pb.administrationOtherExpenses.length) { pb.administrationOtherExpenses.push(new ExpenseItem()); }

            console.log("dynamics data:");
            console.log(d);
            console.log("trans");
            console.log(this.trans);

            this.contractNumber = this.mainTrans.contracts.find(c => c.contractId === d.Contract.vsd_contractid).contractNumber;
            return pb;
          })
          this.constructDefaultstepperElements();
        }
      });
    })
    this.stepperService.stepperElements.subscribe(e => this.stepperElements = e);
    this.stepperService.currentStepperElement.subscribe(e => {
      if (this.currentStepperElement) {
        let formState = this.formHelper.getFormState();

        //in this case there has been a previous update on this tab, and we've come back to that tab and left again. So we don't want to wipe away the incomplete status
        if (this.currentStepperElement.formState !== "incomplete" || formState != "untouched") {
          this.currentStepperElement.formState = formState;
        }
      }
      this.currentStepperElement = e;

      if (this.currentStepperElement && this.stepperElements) {
        this.stepperIndex = this.stepperElements.findIndex(e => e.id === this.currentStepperElement.id);
      }
    });
  }

  isCurrentStepperElement(item: iStepperElement): boolean {
    if (item.id === this.currentStepperElement.id) {
      return true;
    }
    return false;
  }
  constructDefaultstepperElements() {
    this.stepperService.reset();
    // add the program overview
    this.stepperService.addStepperElement(null, 'Overview', 'info', 'program_overview');
    // add the budget navigation for each item
    this.trans.programBudgets.forEach(pb => this.stepperService.addStepperElement(null, pb.name, 'untouched', pb.programId));
    // add the authorization page
    this.stepperService.addStepperElement(null, 'Authorization', 'untouched', 'authorization');
    // set the stepper to the first item
    this.stepperService.setToFirstStepperElement();
  }
  save(isSubmit: boolean = false) {
    if (!this.formHelper.isFormValid(this.notificationQueueService)) {
      return;
    }
    this.saving = true;
    console.log(this.trans);
    this.out = convertBudgetProposalToDynamics(this.trans);
    this.budgetProposalService.setBudgetProposal(this.out).subscribe(
      r => {
        console.log(r);
        this.notificationQueueService.addNotification(`You have successfully saved the budget proposal.`, 'success');
        this.stateService.refresh();
        if (isSubmit) this.router.navigate(['/authenticated/dashboard']);
        this.saving = false;
      },
      err => {
        console.log(err);
        this.notificationQueueService.addNotification('The budget proposal could not be saved. If this problem is persisting please contact your ministry representative.', 'danger');
        this.saving = false;
      }
    );
  }
  exit() {
    if (this.formHelper.isFormDirty()) {
      if (confirm("Are you sure you want to return to the dashboard? All unsaved work will be lost.")) {
        this.stateService.refresh();
        this.router.navigate(['/authenticated/dashboard']);
      }
    }
    else {
      this.stateService.refresh();
      this.router.navigate(['/authenticated/dashboard']);
    }
  }
  // setNextStepper() {
  //   if (!this.formHelper.isFormValid(this.notificationQueueService)) {
  //     this.currentStepperElement.formState = this.formHelper.getFormState();
  //     return;
  //   }
  //   this.save(false);
  //   ++this.stepperIndex;
  //   this.stepperService.setCurrentStepperElement(this.stepperElements[this.stepperIndex].id);
  // }
  // setPreviousStepper() {
  //   --this.stepperIndex;
  //   this.stepperService.setCurrentStepperElement(this.stepperElements[this.stepperIndex].id);
  // }
}
