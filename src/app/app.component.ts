import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin } from 'rxjs';
import {ChartDataValue, Customer, Sales } from './services/dashboard-data-interface';
import { DashboardDataService } from './services/dashboard-data.service';
import { uniq } from 'lodash';
import * as moment from 'moment';
import { SalesChartData } from './components/total-sales-card/total-sales-card.component';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private service: DashboardDataService ) {}

  public salesChartData: SalesChartData | null = null;
  public salesChannelChartData: any;
  public ticketsChartData: any;

  ngOnInit(): void {
    this.getAllData();
  }

  private getAllData(): void {
    forkJoin([
      this.service.getCustomersData(),
      this.service.getSalesData(),
      this.service.getTicketsData(),
    ]).pipe(untilDestroyed(this)).subscribe(([customersData, salesData, ticketsData]) => {
      console.log(customersData, salesData, ticketsData)
      this.salesChartData = this.setSalesChartData(customersData, salesData);
    })
  }

  private setSalesChartData(customerData: Customer[], salesData: Sales[]): SalesChartData {
    let allCustomersSales: ChartDataValue[] = [];
    let loyaltyCustomersSales: ChartDataValue[] = [];
    const uniqDates = uniq(salesData.map((sales) => sales.date))

    uniqDates.forEach((date) => {
      const totalDaySales = salesData.filter((sales) => sales.date === date).reduce((sum, sales) => sum + sales.sales , 0);

      const loyaltyCustomersDaySales = salesData.filter((sales) => sales.date === date && customerData.find((customer) => customer.id === sales.customerId)?.isLoyaltyCustomer ).reduce((sum, sales) => sum + sales.sales , 0);

      if (!!totalDaySales) {
        allCustomersSales.push({
          date: moment.utc(date),
          value: totalDaySales
        })
      }

      if (!!loyaltyCustomersDaySales) {
        loyaltyCustomersSales.push({
          date: moment.utc(date),
          value: loyaltyCustomersDaySales
        })
      }
    })

    return { allCustomers: allCustomersSales, loyaltyCustomers: loyaltyCustomersSales }
  }
}
