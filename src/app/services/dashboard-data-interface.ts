import { Moment } from 'moment';

export enum SalesChannel {
  IN_STORE = "In-store",
  ONLINE = "Online",
}

export interface Sales {
  customerId: number; //1,
  date: string; //"06-01-2023",
  sales: number; // 11000,
  salesChannel: SalesChannel
}

export interface Customer {
  id: number;
  name: string;
  isLoyaltyCustomer: boolean;
}

export interface Ticket {
  customerId: number; //1,
  date: string; //"05-01-2024",
  size: number; //27.01
}

export interface ChartDataValue {
  date: Moment;
  value: number;
}
