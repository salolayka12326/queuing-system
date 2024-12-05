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
  selector: 'app-linear-chart',
  templateUrl: './linear-chart.component.html',
  styleUrl: './linear-chart.component.scss'
})
export class LinearChartComponent {
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

  lndMean: number = 0.5;
  lndDispersion: number = 0.2;

  constructor(private metricsService: MetricsService) {
  }

  ngOnInit(): void {
    setTimeout(()=>{
      this.createLineChart();
    }, 0)
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
          data.push(this.metricsService.calculateQueueLength_FIFO_ED_NUM_M(i, this.mu));
        }
        break;
      }
      case 'FIFO_ED_2': {
        for (let i = this.minN; i <= this.maxN; i+=0.25) {
          labels.push(Number.isInteger(i) ? i : '');
          data.push(this.metricsService.calculateQueueLength_FIFO_ED_NUM_CDF(this.lambda, this.mu, i));
        }
        break;
      }
      case 'FIFO_ED_3': {
        for (let i = this.minLambda; i <= this.maxLambda; i+=0.125) {
          labels.push(Number.isInteger(i) ? i : '');
          data.push(this.metricsService.calculateQueueLength_FIFO_ED_TIME_M(i, this.mu));
        }
        break;
      }
      case 'FIFO_ED_4': {
        for (let i = this.minT; i <= this.maxT; i+=0.25) {
          labels.push(Number.isInteger(i) ? i : '');
          data.push(this.metricsService.calculateQueueLength_FIFO_ED_TIME_CDF(this.lambda, this.mu, i));
        }
        break;
      }
      case 'FIFO_LND_1': {
        for (let i = this.minLambda; i <= this.maxLambda; i += 0.125) {
          labels.push(Number.isInteger(i) ? i : '');
          const dispersion = (Math.exp(this.lndDispersion) - 1) * Math.exp(2 * this.lndMean + this.lndDispersion);
          const mean = Math.exp(this.lndMean + (this.lndDispersion / 2))
          data.push(this.metricsService.calculateQueueLength_FIFO_LND_NUM_M(i, dispersion, mean));
          console.log(i * mean, i, dispersion, mean);
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
      case 'FIFO_LND_1': {
        return ['Лямбда', 'Кількість у черзі'];
      }
    }
    return ['x', 'y'];
  }
}
