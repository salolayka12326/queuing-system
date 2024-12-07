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

  distribution = 'ED';
  distributions = [
    { value: 'ED', label: 'Експоненційний розподіл' },
    { value: 'LND', label: 'Логнормальний розподіл' },
    { value: 'UD', label: 'Рівномірний розподіл' },
    { value: 'GWD', label: 'Розподіл Гнєденко Вейбула' },
    { value: 'PD', label: 'Бета Розподіл' },
  ];

  selectedTab: number = 0;

  updateChart(): void
  {
    this.charts.get(this.selectedTab)?.recalculate();
  }

  onTabChange(event: any): void {
    setTimeout(()=>{
      this.updateChart();
    }, 0)
  }

  onDisciplineChange(event: any): void {
    setTimeout(()=>{
      this.updateChart();
    }, 1000)
  }

  onDistributionChange(event: any): void {
    setTimeout(()=>{
      this.updateChart();
    }, 1000)
  }
}
