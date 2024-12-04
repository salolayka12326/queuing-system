import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MetricsService} from "../services/metrics.service";
import {CategoryScale, Chart, ChartItem, LinearScale, LineController, LineElement, PointElement} from "chart.js";

Chart.register(
  LineController, CategoryScale, LinearScale, PointElement, LineElement
);

@Component({
  selector: 'app-linear-chart',
  templateUrl: './linear-chart.component.html',
  styleUrl: './linear-chart.component.scss'
})
export class LinearChartComponent {

  @Input discipline: string = '';
  @Input distribution: string = '';

  private chart: Chart | undefined;

  minLambda: number = 10;
  maxLambda: number = 30;

  mu: number = 20;

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
    const ctx = document.getElementById('acquisitions') as HTMLCanvasElement;

// Если график уже существует, уничтожаем его
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = [];
    const data = [];

    for (let i = this.minLambda; i <= this.maxLambda; i+=0.5) {  // Генерация значений от x = 0 до x = 10
      labels.push(i);
      data.push(this.metricsService.calculateQueueLength_FIFO_ED(i, this.mu));  // Вычисление значения y для каждого x
    }

    this.chart = new Chart(
      ctx,
      {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'FIFO_ED',  // Название набора данных
              data: data,  // Данные для оси Y
              borderColor: 'rgb(103,58,183)',  // Цвет линии
              backgroundColor: 'rgb(103,58,183)',  // Цвет фона
              fill: true,  // Заполнение под линией
              tension: 0.4  // Сглаживание линии
            }
          ]
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: 'Лямбда '  // Подпись для оси X
              }
            },
            y: {
              title: {
                display: true,
                text: 'Кількість'  // Подпись для оси Y
              }
            }
          }
        }
      }
    );
  }

}
