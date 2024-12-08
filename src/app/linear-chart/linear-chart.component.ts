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
  private _discipline: string = '';
  private _distribution: string = '';
  private _metricNumber: number = 1;

  @ViewChild('acquisitions', {static: true}) acquisitions!: ElementRef<HTMLCanvasElement>;

  @Input()
  set discipline(value: string) {
    this._discipline = value;
    this.updateVales();
  }

  get discipline(): string {
    return this._discipline;
  }

  @Input()
  set distribution(value: string) {
    this._distribution = value;
    this.updateVales();
  }

  get distribution(): string {
    return this._distribution;
  }

  @Input()
  set metricNumber(value: number) {
    this._metricNumber = value;
    this.updateVales();
  }

  get metricNumber(): number {
    return this._metricNumber;
  }

  spinner: boolean = true;

  private chart: Chart | undefined;

  minT: number = 0;
  maxT: number = 10;

  minLambda: number = 0;
  maxLambda: number = 10;

  minN: number = 0;
  maxN: number = 30;

  mu: number = 5;
  lambda: number = 4;

  simulationTime: number = 100;
  simulationNum: number = 100;

  lndMean: number = 0;
  lndDispersion: number = 1;

  gwdLambda: number = 1;
  gwdKappa: number = 0;
  gwdGamma: number = 1;

  udMin: number = 0;
  udMax: number = 1;

  bdMin: number = 0;
  bdMax: number = 1;
  bdAlpha: number = 0.8;
  bdBeta: number = 0.8;

  pdAlpha: number = 1;

  constructor(private metricsService: MetricsService) {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createLineChart();
    }, 0)
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  recalculate() {
    this.spinner = true
    setTimeout(() => {
      this.createLineChart();
    }, 0)
  }

  createLineChart(): void {
    this.spinner = true
    try {
      const ctx = this.acquisitions.nativeElement;

      if (this.chart) {
        this.chart.destroy();
      }

      const labels = [];
      const data = [];

      switch (this.discipline + '_' + this.distribution + '_' + this.metricNumber) {
        case 'FIFO_ED_1': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.125) {
            labels.push(Number.isInteger(i) ? i : '');
            data.push(this.metricsService.calculateQueueLength_FIFO_ED_NUM_M(i, this.mu));
          }
          break;
        }
        case 'FIFO_ED_3': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.125) {
            labels.push(Number.isInteger(i) ? i : '');
            data.push(this.metricsService.calculateQueueLength_FIFO_ED_TIME_M(i, this.mu));
          }
          break;
        }
        case 'FIFO_EDM_1': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.125) {
            labels.push(Number.isInteger(i) ? i : '');
            data.push(this.metricsService.calculateQueueLength_FIFO_ED_GENERATED_NUM_M(i, this.mu, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_EDM_3': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.125) {
            labels.push(Number.isInteger(i) ? i : '');
            data.push(this.metricsService.calculateQueueLength_FIFO_ED_GENERATED_TIME_M(i, this.mu, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_LND_1': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.1) {
            labels.push(i.toFixed(2));
            data.push(this.metricsService.simulateQueue_LND_NUM_M(i, this.lndMean, this.lndDispersion, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_LND_3': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.1) {
            labels.push(i.toFixed(2));
            data.push(this.metricsService.simulateQueue_LND_TIME_M(i, this.lndMean, this.lndDispersion, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_GWD_1': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.1) {
            labels.push(i.toFixed(2));
            data.push(this.metricsService.simulateQueue_GWD_NUM_M(i, this.gwdLambda, this.gwdKappa, this.gwdGamma, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_GWD_3': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.1) {
            labels.push(i.toFixed(2));
            data.push(this.metricsService.simulateQueue_GWD_TIME_M(i, this.gwdLambda, this.gwdKappa, this.gwdGamma, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_UD_1': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.1) {
            labels.push(i.toFixed(2));
            data.push(this.metricsService.simulateQueue_UD_NUM_M(i, this.udMin, this.udMax, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_UD_3': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.1) {
            labels.push(i.toFixed(2));
            data.push(this.metricsService.simulateQueue_UD_TIME_M(i, this.udMin, this.udMax, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_BD_1': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.1) {
            labels.push(i.toFixed(2));
            data.push(this.metricsService.simulateQueue_BD_NUM_M(i, this.bdAlpha, this.bdBeta, this.bdMin, this.bdMax, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_BD_3': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.1) {
            labels.push(i.toFixed(2));
            data.push(this.metricsService.simulateQueue_BD_TIME_M(i, this.bdAlpha, this.bdBeta, this.bdMin, this.bdMax, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_PD_1': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.1) {
            labels.push(i.toFixed(2));
            data.push(this.metricsService.simulateQueue_PD_NUM_M(i, this.bdAlpha, this.simulationTime, this.simulationNum));
          }
          break;
        }
        case 'FIFO_PD_3': {
          for (let i = this.minLambda; i <= this.maxLambda; i += 0.1) {
            labels.push(i.toFixed(2));
            data.push(this.metricsService.simulateQueue_PD_TIME_M(i, this.bdAlpha, this.simulationTime, this.simulationNum));
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
    } catch (e) {
      setTimeout(()=> {
        this.spinner = false;
      }, 1000)
    } finally {
      setTimeout(()=> {
        this.spinner = false;
      }, 1000)
    }
  }

  getLabels(): string[] {
    switch (this.discipline + '_' + this.distribution + '_' + this.metricNumber) {
      case 'FIFO_ED_1': {
        return ['Лямбда', 'Кількість у черзі'];
      }
      case 'FIFO_ED_3': {
        return ['Лямбда', 'Час'];
      }
      case 'FIFO_LND_1': {
        return ['Лямбда', 'Кількість у черзі'];
      }
      case 'FIFO_LND_3': {
        return ['Лямбда', 'Час'];
      }
      case 'FIFO_GWD_1': {
        return ['Лямбда', 'Кількість у черзі'];
      }
      case 'FIFO_GWD_3': {
        return ['Лямбда', 'Час'];
      }
      case 'FIFO_UD_1': {
        return ['Лямбда', 'Кількість у черзі'];
      }
      case 'FIFO_UD_3': {
        return ['Лямбда', 'Час'];
      }
      case 'FIFO_BD_1': {
        return ['Лямбда', 'Кількість у черзі'];
      }
      case 'FIFO_BD_3': {
        return ['Лямбда', 'Час'];
      }
      case 'FIFO_EDM_1': {
        return ['Лямбда', 'Кількість у черзі'];
      }
      case 'FIFO_EDM_3': {
        return ['Лямбда', 'Час'];
      }
      case 'FIFO_PD_1': {
        return ['Лямбда', 'Кількість у черзі'];
      }
      case 'FIFO_PD_3': {
        return ['Лямбда', 'Час'];
      }
    }
    return ['x', 'y'];
  }

  updateVales(): void {
    this.spinner = true;
    switch (this.discipline + '_' + this.distribution + '_' + this.metricNumber) {
      case 'FIFO_ED_1': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 10;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 4;

        this.simulationTime = 1000;

        this.lndMean = 0;
        this.lndDispersion = 1;
        break;
      }
      case 'FIFO_ED_3': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 10;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 4;

        this.simulationTime = 1000;

        this.lndMean = 0;
        this.lndDispersion = 1;
        break;
      }
      case 'FIFO_LND_1': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 3;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 4;

        this.simulationTime = 1000;

        this.lndMean = -2;
        this.lndDispersion = 1;
        break;
      }
      case 'FIFO_LND_3': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 3;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 4;

        this.simulationTime = 1000;

        this.lndMean = -2;
        this.lndDispersion = 1;
        break;
      }
      case 'FIFO_GWD_1': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 3;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 0.5;

        this.simulationTime = 1000;

        this.gwdLambda = 1;
        this.gwdKappa = 1;
        this.gwdGamma = 0;
        break;
      }
      case 'FIFO_GWD_3': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 3;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 0.5;

        this.simulationTime = 1000;

        this.gwdLambda = 1;
        this.gwdKappa = 1;
        this.gwdGamma = 0;
        break;
      }
      case 'FIFO_UD_1': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 3;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 0.5;

        this.simulationTime = 1000;

        this.udMin =0;
        this.udMax = 1;
        break;
      }
      case 'FIFO_UD_3': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 3;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 0.5;

        this.simulationTime = 1000;

        this.udMin =0;
        this.udMax = 1;
        break;
      }
      case 'FIFO_BD_1': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 3;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 0.5;

        this.simulationTime = 1000;

        this.bdMin =0;
        this.bdMax = 1;
        this.bdAlpha =0.8;
        this.bdBeta = 0.8;
        break;
      }
      case 'FIFO_BD_3': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 3;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 0.5;

        this.simulationTime = 1000;

        this.bdMin =0;
        this.bdMax = 1;
        this.bdAlpha =0.8;
        this.bdBeta = 0.8;
        break;
      }
      case 'FIFO_EDM_1': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 10;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 5;

        this.simulationTime = 1000;

        this.bdMin =0;
        this.bdMax = 1;
        this.bdAlpha =0.8;
        this.bdBeta = 0.8;
        break;
      }
      case 'FIFO_EDM_3': {
        this.minT = 0;
        this.maxT = 10;

        this.minLambda = 0;
        this.maxLambda = 10;

        this.minN = 0;
        this.maxN = 30;

        this.mu = 5;
        this.lambda = 5;

        this.simulationTime = 1000;

        this.bdMin =0;
        this.bdMax = 1;
        this.bdAlpha =0.8;
        this.bdBeta = 0.8;
        break;
      }
    }
  }
}
