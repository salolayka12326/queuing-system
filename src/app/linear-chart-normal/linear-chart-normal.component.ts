import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MetricsService} from "../services/metrics.service";
import {
  CategoryScale,
  Chart,
  ChartItem,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement, Tooltip
} from "chart.js";

Chart.register(
  LineController, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip
);

@Component({
  selector: 'app-linear-normal-chart',
  templateUrl: './linear-chart-normal.component.html',
  styleUrl: './linear-chart.component.scss'
})
export class LinearChartNormalComponent {
  @ViewChild('acquisitions', { static: true }) acquisitions!: ElementRef<HTMLCanvasElement>;

  @Input() discipline: string = '';
  @Input() distribution: string = '';
  @Input() metricNumber: number = 1;

  private chart: Chart | undefined;

  minT: number = 0;
  maxT: number = 10;

  minLambda: number = 0;
  maxLambda: number = 10;

  minN: number = 0;
  maxN: number = 30;

  mu: number = 5;
  lambda: number = 4;

  constructor(private metricsService: MetricsService) {
  }

  ngAfterViewInit(): void {
    setTimeout(()=>{
      this.createLineChart();
    }, 0)
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  recalculate() {
    setTimeout(()=>{
      this.createLineChart();
    }, 0)
  }

  createLineChart(): void {
    const ctx = this.acquisitions.nativeElement;

// Если график уже существует, уничтожаем его
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = [];
    const data = [];

    console.log(this.discipline+'_'+this.distribution+'_'+this.metricNumber);
    switch (this.discipline+'_'+this.distribution+'_'+this.metricNumber) {
      case 'FIFO_ED_1': {
        for (let i = this.minLambda; i <= this.maxLambda; i+=0.125) {
          labels.push(Number.isInteger(i) ? i : '');
          data.push(this.metricsService.calculateQueueLength_FIFO_ED_NUM_M(i, this.mu));  // Вычисление значения y для каждого x
        }
        break;
      }
      case 'FIFO_ED_2': {
        for (let i = this.minN; i <= this.maxN; i+=0.25) {
          labels.push(Number.isInteger(i) ? i : '');
          data.push(this.metricsService.calculateQueueLength_FIFO_ED_NUM_CDF(this.lambda, this.mu, i));  // Вычисление значения y для каждого x
        }
        break;
      }
      case 'FIFO_ED_3': {
        for (let i = this.minLambda; i <= this.maxLambda; i+=0.125) {
          labels.push(Number.isInteger(i) ? i : '');
          data.push(this.metricsService.calculateQueueLength_FIFO_ED_TIME_M(i, this.mu));  // Вычисление значения y для каждого x
        }
        break;
      }
      case 'FIFO_ED_4': {
        for (let i = this.minT; i <= this.maxT; i+=0.25) {
          labels.push(Number.isInteger(i) ? i : '');
          data.push(this.metricsService.calculateQueueLength_FIFO_ED_TIME_CDF(this.lambda, this.mu, i));  // Вычисление значения y для каждого x
        }
        break;
      }
    }



    this.chart = new Chart(
      ctx,
      {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,  // Данные для оси Y
              borderColor: 'rgb(103,58,183)',  // Цвет линии
              backgroundColor: 'rgb(103,58,183)',  // Цвет фона
              fill: false,  // Заполнение под линией
              tension: 0.4  // Сглаживание линии
            }
          ]
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: this.getLabels()[0]  // Подпись для оси X
              }
            },
            y: {
              title: {
                display: true,
                text: this.getLabels()[1]  // Подпись для оси Y
              }
            }
          }
        }
      }
    );
  }

  getLabels(): string[]
  {
    switch (this.discipline+'_'+this.distribution+'_'+this.metricNumber) {
      case 'FIFO_ED_1': {
        return ['Лямбда', 'Кількість у черзі'];
      }
      case 'FIFO_ED_2': {
        return ['Кількість у черзі', 'Ймовірність'];
      }
      case 'FIFO_ED_3': {
        return ['Лямбда', 'Час'];
      }
      case 'FIFO_ED_4': {
        return ['Час', 'Ймовірність'];
      }
    }
    return ['x', 'y'];
  }
}
