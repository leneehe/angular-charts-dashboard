import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin } from 'rxjs';
import {ChartDataValue, Customer, DateRangeOptions, Sales } from './services/dashboard-data-interface';
import { DashboardDataService } from './services/dashboard-data.service';
import { uniq } from 'lodash';
import * as moment from 'moment';
import { SalesChartData } from './components/total-sales-card/total-sales-card.component';
import { FormControl } from '@angular/forms';

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

  public salesDateRangeControl = new FormControl(DateRangeOptions[0].value);
  private customersData: Customer[] = [];
  private salesData: Sales[] = [];

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
      this.customersData = customersData;
      this.salesData = salesData;
      this.salesChartData = this.setSalesChartData(customersData, salesData);
    })
  }

  public onDateRangeChanged(newDateRange: string): void {
    this.salesChartData = this.setSalesChartData(this.customersData, this.salesData, newDateRange)
  }

  private setSalesChartData(customerData: Customer[], salesData: Sales[], dateRange: string = this.salesDateRangeControl.value): SalesChartData {
    let dateRangeMomentsArray = salesData.map((sales) => moment.utc(sales.date))
    switch(dateRange) {
      case DateRangeOptions[0].value:
        // last month
        dateRangeMomentsArray = [...salesData].map((sales) => moment.utc(sales.date)).filter(date => date.year() === 2024 && date.month() === 5); // June is month 5 (0-indexed)
        break;
      case DateRangeOptions[1].value:
        // last quarter
        dateRangeMomentsArray = [...salesData].map((sales) => moment.utc(sales.date)).filter(date => date.year() === 2024 && date.month() >= 3 && date.month() <= 5 );
        break;
      case DateRangeOptions[2].value:
        // last year
        dateRangeMomentsArray = [...salesData].map((sales) => moment.utc(sales.date)).filter(date => date.year() === 2023);
        break;
      default:
        dateRangeMomentsArray = [...salesData].map((sales) => moment.utc(sales.date))
    }
    let allCustomersSales: ChartDataValue[] = [];
    let loyaltyCustomersSales: ChartDataValue[] = [];
    const uniqDates = uniq(dateRangeMomentsArray.map(date => date.format("MM-DD-YYYY"))).map(dateString => moment.utc(dateString));

    uniqDates.forEach((date) => {
      const totalDaySales = salesData.filter((sales) => moment.utc(sales.date).isSame(date)).reduce((sum, sales) => sum + sales.sales , 0);

      const loyaltyCustomersDaySales = salesData.filter((sales) => moment.utc(sales.date).isSame(date) && customerData.find((customer) => customer.id === sales.customerId)?.isLoyaltyCustomer ).reduce((sum, sales) => sum + sales.sales , 0);

      if (!!totalDaySales) {
        allCustomersSales.push({
          date: date,
          value: totalDaySales
        })
      }

      if (!!loyaltyCustomersDaySales) {
        loyaltyCustomersSales.push({
          date: date,
          value: loyaltyCustomersDaySales
        })
      }
    })

    return { allCustomers: allCustomersSales, loyaltyCustomers: loyaltyCustomersSales }
  }
}
