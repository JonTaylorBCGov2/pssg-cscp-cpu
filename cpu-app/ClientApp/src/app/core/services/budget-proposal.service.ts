import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { iDynamicsBudgetProposal } from '../models/dynamics-blob';

@Injectable({
  providedIn: 'root'
})
export class BudgetProposalService {

  // this should query the test api
  apiUrl = 'api/DynamicsBudgetProposal';

  constructor(
    private http: HttpClient,
  ) { }

  getBudgetProposal(organizationId: string, userId: string, contractId: string): Observable<iDynamicsBudgetProposal> {
    return this.http.get<iDynamicsBudgetProposal>(`${this.apiUrl}/${organizationId}/${userId}/${contractId}`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
  setBudgetProposal(budgetProposal: any) {
  }

  get headers(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }
  protected handleError(err): Observable<never> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = err.error.message;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}, body was: ${err.message}`;
    }
    return throwError(errorMessage);
  }
}
