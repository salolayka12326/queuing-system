import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  constructor() { }

  calculateQueueLength_FIFO_ED(lambda: number, mu: number): number {
    if (lambda >= mu) {
      //throw new Error('Интенсивность поступления (lambda) должна быть меньше интенсивности обслуживания (mu).');
    }
    const rho = lambda / mu; // Коэффициент загрузки
    return (lambda ** 2) / (2 * mu ** 2 * (1 - rho));
  }

  calculateQueueLength_FIFO_ED_TIME(lambda: number, mu: number): number {
    return (lambda * (1 / (mu ** 2)) + mu ** 2) / (2 * (mu - lambda));
  }
}
