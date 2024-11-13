import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DATA2 } from '../data/mock-data';
import {Customer, Sales, Ticket } from './dashboard-data-interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {

  constructor() { }

  getSalesData(): Observable<Sales[]> {
    return of(DATA2.sales)
  }

  getCustomersData(): Observable<Customer[]> {
    return of(DATA2.customers)
  }

  getTicketsData(): Observable<Ticket[]> {
    return of(DATA2.tickets)
  }
}
