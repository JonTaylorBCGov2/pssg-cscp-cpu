import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from './core/guards/authentication.guard';
import { BudgetProposalComponent } from './authenticated/budget-proposal/budget-proposal.component';
import { DashboardComponent } from './authenticated/dashboard/dashboard.component';
import { ExpenseReportComponent } from './authenticated/expense-report/expense-report.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { PersonnelComponent } from './authenticated/personnel/personnel.component';
import { ProfileComponent } from './authenticated/profile/profile.component';
import { ProgramApplicationComponent } from './authenticated/program-application/program-application.component';
import { StatusReportComponent } from './authenticated/status-report/status-report.component';
import { TestComponent } from './test/test.component';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'test',
    component: TestComponent
  },
  {
    path: 'authenticated',
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'budget_proposal/:contractId',
        component: BudgetProposalComponent
      },
      {
        path: 'budget_proposal',
        component: BudgetProposalComponent
      },
      {
        path: 'expense_report/:contractId',
        component: ExpenseReportComponent
      },
      {
        path: 'expense_report',
        component: ExpenseReportComponent
      },
      {
        path: 'program_application/:contractId',
        component: ProgramApplicationComponent
      },
      {
        path: 'program_application',
        component: ProgramApplicationComponent
      },
      {
        path: 'status_report/:contractId',
        component: StatusReportComponent
      },
      {
        path: 'status_report',
        component: StatusReportComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'personnel',
        component: PersonnelComponent
      },
    ]
  },
  {
    path: '**',
    component: NotFoundComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
