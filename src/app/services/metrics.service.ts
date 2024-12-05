import {Injectable} from '@angular/core';

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

  calculateQueueLength_FIFO_LND_NUM_M(lambda: number, dispersion: number, mean: number): number {
    return (Math.pow(lambda, 2) * dispersion) / (2 * (1 - lambda * mean));
  }

  calculateQueueLength_FIFO_LND_NUM_CDF(lambda: number, mu: number, n: number): number {
    const rho = lambda / mu;
    return 1 - Math.pow(rho, n+1);
  }

  calculateQueueLength_FIFO_LND_TIME_M(lambda: number, mu: number): number {
    return lambda / (mu * (mu - lambda));
  }

  calculateQueueLength_FIFO_LND_TIME_CDF(lambda: number, mu: number, t: number): number {
    return 1 - Math.exp(-(mu - lambda) * t);
  }
}
