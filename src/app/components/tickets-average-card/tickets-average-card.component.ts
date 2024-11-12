import { Component, Input, OnInit, AfterViewInit, ViewChild, } from '@angular/core';
import { ChartDataValue } from 'src/app/services/dashboard-data-interface';
import { mean } from 'lodash';
import { DecimalPipe } from '@angular/common';
import { ChartConfiguration, ChartType, TooltipItem } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-tickets-average-card',
  templateUrl: './tickets-average-card.component.html',
  styleUrls: ['./tickets-average-card.component.scss'],
  providers: [DecimalPipe]
})
export class TicketsAverageCardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @Input() public chartData: TicketsChartData | null = null;

  public period: string | null = null;
  public formattedAllCustomers: string | null = "";
  public formattedLoyaltyCustomers: string | null = "";

  constructor(private decimalPipe: DecimalPipe) { }

  public chartType: ChartType = 'scatter';
  public chartConfigData: ChartConfiguration['data'] & any = {labels: [], datasets: []};
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label(tooltipItem: TooltipItem<'line'>): string | string[] {
            let label = tooltipItem.dataset.label || '';

            if (label) {
              label += ': ';
              const value = tooltipItem.raw as number;
              label += Math.round(value * 100) / 100;
            }

            return label.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          },
          title: (tooltipItems: TooltipItem<'line'>[]) => {
            // Get the index of the data point in the dataset
            const index = tooltipItems[0].dataIndex;
            // Return the label from the x-axis
            return tooltipItems[0].chart.data.labels![index] as string;
          }
        },
      },
    }
  }

  ngOnInit(): void {
    this.setMetrics();
    this.setChartData();
  }

  ngAfterViewInit(): void {
    this.generateCustomLegend();
  }

  private setMetrics(): void {
    if (!this.chartData) return;
    this.formattedAllCustomers = this.decimalPipe.transform( mean(this.chartData.allCustomers.map((data) => data.value)), '1.2-2');
    this.formattedLoyaltyCustomers = this.decimalPipe.transform(mean(this.chartData.loyaltyCustomers.map((data) => data.value)),
      '1.2-2');
  }

  private setChartData(): void {
    if (!this.chartData) return;

    const {allCustomers, loyaltyCustomers, avgTicketsPerCustomer} = this.chartData

    const labels = allCustomers.map((data) => data.date.format('ll'))
    if (labels?.length) {
      this.period = allCustomers[0].date.format('MMMM D') + ' - ' + this.chartData?.allCustomers[labels.length - 1].date.format('LL');
    }

    const avgAllCustomersDataset = {
      type: 'line',
      label: 'All Customers',
      data: allCustomers.map((data) => data.value),
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.3)', // Set opacity for area fill
      pointBackgroundColor: ['rgba(75,192,192,1)'],
    }

    const avgLoyaltyCustomersDataset = {
      type: 'line',
      label: 'Loyalty Customers',
      data: loyaltyCustomers.map((data) => data.value),
      borderColor: 'rgba(153,102,255,1)',
      backgroundColor: 'rgba(153,102,255,0.3)', // Set opacity for area fill
      pointBackgroundColor: ['rgba(153,102,255,1)'],
    }

    const customersDatasets = this.chartData.customers.map((customer) => {
        return {
          type: 'bar',
          label: customer,
          data: avgTicketsPerCustomer.get(customer)?.map((data) => data.value)
        }
      }
    );
    this.chartConfigData = {
      labels,
      datasets: [...customersDatasets, avgAllCustomersDataset, avgLoyaltyCustomersDataset]
    }
  }

  private generateCustomLegend(): void {
    const datasets = this.chartConfigData.datasets;
    const chartLegendDiv1 = document.getElementById('ticket-chart-legend-all-customers');
    if (chartLegendDiv1 && datasets) {
      const dataset1 = datasets[datasets.length - 2];
      const idx1 = datasets.indexOf(dataset1)
      const legendHtml1 = `
        <div class="d-flex align-items-center">
          <span class="legend-color" style="background-color:${dataset1.borderColor}; width: 12px; height: 12px; display: inline-block; margin-right: 8px;"></span>
          <span class="text-muted">${dataset1.label}</span>
        </div>`;
      chartLegendDiv1.innerHTML = legendHtml1;
    }
    const chartLegendDiv2 = document.getElementById('ticket-chart-legend-loyalty-customers');
    if (chartLegendDiv2 && datasets) {
      const dataset2 = datasets[datasets.length - 1];
      const idx2 = datasets.indexOf(dataset2);
      const legendHtml2 = `
        <div class="d-flex align-items-center">
          <span class="legend-color" style="background-color:${dataset2.borderColor}; width: 12px; height: 12px; display: inline-block; margin-right: 8px;"></span>
          <span class="text-muted">${dataset2.label}</span>
        </div>`;
      chartLegendDiv2.innerHTML = legendHtml2;
    }
  }
}
export interface TicketsChartData {
  allCustomers: ChartDataValue[];
  loyaltyCustomers: ChartDataValue[];
  avgTicketsPerCustomer: Map<string, ChartDataValue[]>;
  customers: string[];
}
