import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin } from 'rxjs';
import {ChartDataValue, Customer, DateRangeOptions, Sales, SalesChannel, Ticket } from './services/dashboard-data-interface';
import { DashboardDataService } from './services/dashboard-data.service';
import { uniq, mean } from 'lodash';
import * as moment from 'moment';
import { SalesChartData } from './components/total-sales-card/total-sales-card.component';
import { FormControl } from '@angular/forms';
import { SalesChannelChartData } from './components/sales-channel-card/sales-channel-card.component';
import { TicketsChartData } from './components/tickets-average-card/tickets-average-card.component';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private service: DashboardDataService ) {}

  public salesChartData: SalesChartData | null = null;
  public salesChannelChartData: SalesChannelChartData | null = null;
  public ticketsChartData: TicketsChartData | null = null;

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
      this.customersData = customersData;
      this.salesData = salesData;
      this.salesChartData = this.setSalesChartData(customersData, salesData);
      this.salesChannelChartData = this.setSalesChannelChartData(salesData)
      this.ticketsChartData = this.setTicketsChartData(customersData, ticketsData);
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

  private setSalesChannelChartData(salesData: Sales[]): SalesChannelChartData {
    const inStoreSalesData = salesData.filter((sales) => sales.salesChannel === SalesChannel.IN_STORE && moment.utc(sales.date).year() === 2024 && moment.utc(sales.date).month() === 5); // June is month 5 (0-indexed)
    const onlineSalesData = salesData.filter((sales) => sales.salesChannel === SalesChannel.ONLINE && moment.utc(sales.date).year() === 2024 && moment.utc(sales.date).month() === 5); // June is month 5 (0-indexed)

    const inStoreSalesTotal = inStoreSalesData.reduce((total, sales) => total + sales.sales, 0)
    const onlineSalesTotal = onlineSalesData.reduce((total, sales) => total + sales.sales, 0)

    const allDates = uniq(inStoreSalesData.map((sales) => sales.date))
    const period = moment.utc(allDates[0]).format('MMMM D') + ' - ' + moment.utc(allDates[allDates.length - 1]).format('LL')

    return {inStore: inStoreSalesTotal, online: onlineSalesTotal, period}
  }

  private setTicketsChartData(customerData: Customer[], ticketsData: Ticket[]):TicketsChartData {
    let avgTicektsAllCustomers: ChartDataValue[] = [];
    let avgTicketsLoyaltyCustomers: ChartDataValue[] = [];
    const uniqDates =  uniq(ticketsData.map((ticket) => ticket.date));

    uniqDates.forEach((date) => {
      const dailyTicketAvg = mean(ticketsData.filter((ticket) => ticket.date === date).map((ticket) => ticket.size))
      const loyaltyCustomersDailyAvg = mean(ticketsData.filter((ticket) => ticket.date === date && customerData.find((customer) => customer.id === ticket.customerId)?.isLoyaltyCustomer).map((ticket) => ticket.size))

      if (!!dailyTicketAvg) {
        avgTicektsAllCustomers.push({
          date: moment.utc(date),
          value: dailyTicketAvg
        })
      }

      if (!!avgTicketsLoyaltyCustomers) {
        avgTicketsLoyaltyCustomers.push({
          date: moment.utc(date),
          value: loyaltyCustomersDailyAvg
        })
      }
    })

    let avgTicketsPerCustomer = new Map<string, ChartDataValue[]>()
    customerData.forEach((customer) => {
      const data = ticketsData.filter((ticket) => ticket.customerId === customer.id).map((ticket) => {
        return {
          date: moment.utc(ticket.date),
          value: ticket.size
        }
      })
      avgTicketsPerCustomer.set(customer.name, data)
    })

    const customers = customerData.map((customer) => customer.name)

    return {allCustomers: avgTicektsAllCustomers, loyaltyCustomers: avgTicketsLoyaltyCustomers, avgTicketsPerCustomer, customers}
  }
}
