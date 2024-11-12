import {ChangeDetectionStrategy, Component, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {ChartConfiguration, ChartType, TooltipItem } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-sales-channel-card',
  templateUrl: './sales-channel-card.component.html',
  styleUrls: ['./sales-channel-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe]
})
export class SalesChannelCardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @Input() public chartData: SalesChannelChartData | null = {
    inStore: null,
    online: null,
    period: null,
  }

  constructor(private currencyPipe: CurrencyPipe) { }

  public chartType: ChartType = 'bar';
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
  }

  public formattedOnlineTotal: string = "";
  public formattedInStoreTotal: string = "";

  ngOnInit(): void {
    this.setMetrics();
    this.setChartData();
  }

  ngAfterViewInit(): void {
    this.generateCustomLegend();
  }

  private setMetrics(): void {
    if (!this.chartData) return;
    this.formattedOnlineTotal = this.currencyPipe.transform(this.chartData.online, 'USD', 'symbol', '1.0-0') || '';
    this.formattedInStoreTotal = this.currencyPipe.transform(this.chartData.inStore, 'USD', 'symbol', '1.0-0') || '';
  }

  private setChartData(): void {
    if (!this.chartData) return;
    this.chartConfigData = {
      labels: ['Sales channels'],
      datasets: [{
        label: 'In-Store',
        data: [this.chartData.inStore],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.3)',
        hoverBackgroundColor: 'rgba(75,192,192,0.6)',
      },
        {
          label: 'Online',
          data: [this.chartData.online],
          borderColor: 'rgba(153,102,255,1)',
          backgroundColor: 'rgba(153,102,255,0.3)',
          hoverBackgroundColor: 'rgba(153,102,255,0.6)',
        }]
    }
  }

  private generateCustomLegend(): void {
    const chartLegendDiv1 = document.getElementById('chart-legend-instore');
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
    const chartLegendDiv2 = document.getElementById('chart-legend-online');
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
    const legendText = document.querySelectorAll('.bar-chart-legend .text-muted')[index];
    const legendColor = document.querySelectorAll('.bar-chart-legend .legend-color')[index];
    legendText.classList.toggle('text-decoration-line-through', dataset.hidden);
    legendColor.classList.toggle('bg-white', dataset.hidden)

    // Update the chart to reflect the change
    this.chart?.update();
  }

}

export interface SalesChannelChartData {
  inStore: number | null;
  online: number | null
  period: string | null
}
