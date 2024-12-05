import {Component, QueryList, ViewChildren} from '@angular/core';
import {LinearChartComponent} from "./linear-chart/linear-chart.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChildren('appLineChart') charts!: QueryList<LinearChartComponent>;

  discipline = 'FIFO';
  disciplines = [
    { value: 'FIFO', label: 'First In, First Out' },
    { value: 'LIFO', label: 'Last In, First Out' },
    { value: 'SIRO', label: 'Service In Random Order' },
    { value: 'PS', label: 'Processor Sharing' },
    { value: 'SJF', label: 'Shortest Job First' },
    { value: 'SRT', label: 'Shortest Remaining Time' },
    { value: 'PWA', label: 'Priority with Aging' },
  ];

  distribution = 'LND';
  distributions = [
    { value: 'LND', label: 'Логнормальний розподіл' },
    { value: 'ED', label: 'Експоненційний розподіл' },
    { value: 'UD', label: 'Рівномірний розподіл' },
    { value: 'GWD', label: 'Розподіл Гнєденко Вейбула' },
    { value: 'PD', label: 'Розподіл Парето' },
    { value: 'CD', label: 'Розподіл Коші' },
  ];

  selectedTab: number = 0;

  updateChart(): void
  {
    this.charts.get(this.selectedTab)?.recalculate();
  }

  onTabChange(event: any): void {
    this.charts.get(this.selectedTab)?.updateVales();
    this.updateChart();
  }

  onDisciplineChange(event: any): void {
    this.charts.get(this.selectedTab)?.updateVales();
    this.updateChart();
  }

  onDistributionChange(event: any): void {
    this.charts.get(this.selectedTab)?.updateVales();
    this.updateChart();
  }
}
