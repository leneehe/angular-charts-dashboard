import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { TotalSalesCardComponent } from './components/total-sales-card/total-sales-card.component';
import { SalesChannelCardComponent } from './components/sales-channel-card/sales-channel-card.component';
import { TicketsAverageCardComponent } from './components/tickets-average-card/tickets-average-card.component'
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    TotalSalesCardComponent,
    SalesChannelCardComponent,
    TicketsAverageCardComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatSelectModule,
    NgChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
