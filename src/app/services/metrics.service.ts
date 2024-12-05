import {Injectable} from '@angular/core';
import * as d3 from 'd3-random'
@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  constructor() {
  }

  calculateQueueLength_FIFO_ED_NUM_M(lambda: number, mu: number): number {
    return Math.pow(lambda, 2) / (mu * (mu - lambda));
  }

  calculateQueueLength_FIFO_ED_NUM_CDF(lambda: number, mu: number, n: number): number {
    const rho = lambda / mu;
    return 1 - Math.pow(rho, n+1);
  }

  calculateQueueLength_FIFO_ED_TIME_M(lambda: number, mu: number): number {
    return lambda / (mu * (mu - lambda));
  }

  calculateQueueLength_FIFO_ED_TIME_CDF(lambda: number, mu: number, t: number): number {
    return 1 - Math.exp(-(mu - lambda) * t);
  }

  simulateQueue_LND_NUM_M(lambda: number, mu: number, sigma: number, simulationTime: number): number {
    let totalQueueLength = 0;
    let queue = 0; // Текущая длина очереди
    let currentTime = 0;



    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomLogNormal(mu, sigma)();


    let serviceEndTime = 0;

    // Симуляция событий
    while (currentTime < simulationTime) {
      const arrivalTime = currentTime + generateInterArrivalTime();

      if (arrivalTime > simulationTime) {
        break; // Остановка, если заявка пришла после окончания симуляции
      }

      const serviceTime = generateServiceTime();

      if (arrivalTime >= serviceEndTime) {
        // Заявка обслуживается немедленно
        serviceEndTime = arrivalTime + serviceTime;
        queue = 0;
      } else {
        // Заявка добавляется в очередь
        queue++;
        serviceEndTime += serviceTime;
      }

      // Добавляем текущую длину очереди к общему счетчику
      totalQueueLength += queue;

      // Переходим к следующему событию
      currentTime = arrivalTime;
    }

    // Средняя длина очереди
    return totalQueueLength / simulationTime;
  }

}
