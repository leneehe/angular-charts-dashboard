import { ChangeDetectionStrategy, Component, Input, OnInit, AfterViewInit, OnChanges, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ChartDataValue, DateRangeOptions } from 'src/app/services/dashboard-data-interface';
import { sum } from 'lodash';
import { CurrencyPipe } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, TooltipItem } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { BaseChartDirective } from 'ng2-charts';
import { FormControl } from '@angular/forms';

Chart.register(zoomPlugin);

@Component({
  selector: 'app-total-sales-card',
  templateUrl: './total-sales-card.component.html',
  styleUrls: ['./total-sales-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe]
})
export class TotalSalesCardComponent implements OnInit {
  public dateRangeOptions = DateRangeOptions;

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @Input() public chartData: SalesChartData | null = null;
  @Input() public control: FormControl = new FormControl(this.dateRangeOptions[0].value);
  @Output() public dateRangeChanged: EventEmitter<string> = new EventEmitter<string>();

  constructor(private currencyPipe: CurrencyPipe) {}

  private allCustomersSalesTotal: number = 0;
  private loyaltyCustomersSalesTotal: number = 0;
  public formattedAllCustomers: string = "";
  public formattedLoyaltyCustomers: string = "";

  public period: string | null = null;

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
      legend: { display: false },
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy', // Enable panning in the xy direction
        },
        zoom: {
          wheel: {
            enabled: true // Enable zooming with the mouse wheel
          },
          pinch: {
            enabled: true // Enable zooming with pinch gestures on touch devices
          },
          mode: 'xy' // Enable zooming in the xy direction
        }
      },
      tooltip: {
        callbacks: {
          label(tooltipItem: TooltipItem<'line'>): string | string[] {
            let label = tooltipItem.dataset.label || '';

            if (label) {
              label += ': $';
              const value = tooltipItem.raw as number;
              label += Math.round(value * 100) / 100;
            }

            return label.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          },
        },
      },
    }
  };

  ngOnInit(): void {
    this.setMetrics();
    this.setChartData();

    this.control.valueChanges.subscribe((value) => this.dateRangeChanged.emit(value))
  }

  ngAfterViewInit(): void {
    this.generateCustomLegend();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData']) {
      this.setMetrics();
      this.setChartData();
    }
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

  private generateCustomLegend(): void {
    const chartLegendDiv1 = document.getElementById('chart-legend-all-customers');
    if (chartLegendDiv1 && this.chartConfigData.datasets) {
      const dataset1 = this.chartConfigData.datasets[0]
      const legendHtml1 = `
        <div class="d-flex align-items-center" style="cursor: pointer">
          <span class="legend-color" style="background-color:${dataset1.borderColor}; width: 12px; height: 12px; display: inline-block; margin-right: 8px;"></span>
          <span class="text-muted">${dataset1.label}</span>
        </div>`;
      chartLegendDiv1.innerHTML = legendHtml1;
      chartLegendDiv1.addEventListener('click', (event) => {
        this.toggleDatasetVisibility(0);
      });
    }

    const chartLegendDiv2 = document.getElementById('chart-legend-loyalty-customers');
    if (chartLegendDiv2 && this.chartConfigData.datasets) {
      const dataset2 = this.chartConfigData.datasets[1]
      const legendHtml2 = `
        <div class="d-flex align-items-center" style="cursor: pointer">
          <span class="legend-color" style="background-color:${dataset2.borderColor}; width: 12px; height: 12px; display: inline-block; margin-right: 8px;"></span>
          <span class="text-muted">${dataset2.label}</span>
        </div>`;
      chartLegendDiv2.innerHTML = legendHtml2;
      chartLegendDiv2.addEventListener('click', (event) => {
        this.toggleDatasetVisibility(1);
      });
    }
  }

  private toggleDatasetVisibility(index: number): void {
    // Toggle the hidden property of the dataset
    const dataset = this.chartConfigData.datasets[index];
    dataset.hidden = !dataset.hidden;

    // Update legend item style
    const legendText = document.querySelectorAll('.area-chart-legend .text-muted')[index];
    const legendColor = document.querySelectorAll('.area-chart-legend .legend-color')[index];
    legendText.classList.toggle('text-decoration-line-through', dataset.hidden);
    legendColor.classList.toggle('bg-white', dataset.hidden)

    // Update the chart to reflect the change
    this.chart?.update();
  }
}

export interface SalesChartData {
  allCustomers: ChartDataValue[];
  loyaltyCustomers: ChartDataValue[];
}
