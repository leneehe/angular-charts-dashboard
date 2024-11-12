import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DashboardDataService } from './services/dashboard-data.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private service: DashboardDataService ) {
  }

  ngOnInit(): void {
    forkJoin([
      this.service.getCustomersData(),
      this.service.getSalesData(),
      this.service.getTicketsData(),
    ]).subscribe(([customersData, salesData, ticketsData]) => {
      console.log(customersData, salesData, ticketsData)
    })

  }
}
