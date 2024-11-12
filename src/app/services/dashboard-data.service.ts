import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DATA } from '../data/mock-data';
import {Customer, Sales } from './dashboard-data-interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {

  constructor() { }

  getSalesData(): Observable<Sales[]> {
    return of(DATA.sales)
  }

  getCustomersData(): Observable<Customer[]> {
    return of(DATA.customers)
  }
  
  getTicketsData(): Observable<any[]> {
    return of(DATA.tickets)
  }
}
