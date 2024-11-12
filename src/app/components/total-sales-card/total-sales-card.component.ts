import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ChartDataValue } from 'src/app/services/dashboard-data-interface';
import { sum } from 'lodash';
import { CurrencyPipe } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);

@Component({
  selector: 'app-total-sales-card',
  templateUrl: './total-sales-card.component.html',
  styleUrls: ['./total-sales-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe]
})
export class TotalSalesCardComponent implements OnInit {

  @Input() public chartData: SalesChartData | null = null;

  private allCustomersSalesTotal: number = 0;
  private loyaltyCustomersSalesTotal: number = 0;
  public formattedAllCustomers: string = "";
  public formattedLoyaltyCustomers: string = "";
  public period: string|null = null;

  constructor(private currencyPipe: CurrencyPipe) {}

  public chartType: ChartType = 'line';
  public chartConfigData: ChartConfiguration['data'] = {labels: [], datasets: []}
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value, index, values) {
            return value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            });
          },
        }
      }
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x', // Enable panning in the x direction
        },
        zoom: {
          wheel: {
            enabled: true // Enable zooming with the mouse wheel
          },
          pinch: {
            enabled: true // Enable zooming with pinch gestures on touch devices
          },
          mode: 'x' // Enable zooming in the x direction
        }
      }
    }
  };

  ngOnInit(): void {
    this.setMetrics();
    this.setChartData();
  }

  private setMetrics(): void {
    this.allCustomersSalesTotal = sum(this.chartData?.allCustomers.map((data) => data.value))
    this.loyaltyCustomersSalesTotal = sum(this.chartData?.loyaltyCustomers.map((data) => data.value))
    this.formattedAllCustomers = this.currencyPipe.transform(this.allCustomersSalesTotal, 'USD', 'symbol', '1.0-0') || '';
    this.formattedLoyaltyCustomers = this.currencyPipe.transform(this.loyaltyCustomersSalesTotal, 'USD', 'symbol', '1.0-0') || '';
  }

  private setChartData(): void {
    const labels = this.chartData?.allCustomers.map((data) => data.date.format('ll'))
    if (labels?.length) {
      this.period = this.chartData?.allCustomers[0].date.format('MMMM D') + ' - ' + this.chartData?.allCustomers[labels.length - 1].date.format('LL');
    }

    const allCustomersDataset: any = {
      label: 'All Customers',
      data: this.chartData?.allCustomers.map((data) => data.value),
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.3)', // Set opacity for area fill
      pointBackgroundColor: ['rgba(75,192,192,1)'],
      fill: true,
    }
    const loyaltyCustomersDataset: any = {
      label: 'Loyalty Customers',
      data: this.chartData?.loyaltyCustomers.map((data) => data.value),
      borderColor: 'rgba(153,102,255,1)',
      backgroundColor: 'rgba(153,102,255,0.3)', // Set opacity for area fill
      pointBackgroundColor: ['rgba(153,102,255,1)'],
      fill: true,
    }

    this.chartConfigData = {
        labels,
        datasets: [allCustomersDataset, loyaltyCustomersDataset],
    }
  }
}

export interface SalesChartData {
  allCustomers: ChartDataValue[];
  loyaltyCustomers: ChartDataValue[];
}
