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

  simulateQueue_LND_NUM_M(lambda: number, mu: number, sigma: number, simulationTime: number, simulationNum: number): number {
    let queueSizeM: number = 0;

    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomLogNormal(mu, sigma)();

    for (let sim = 0; sim < simulationNum; sim++) {

      let totalQueueLength = 0;
      let queue = 0; // Текущая длина очереди
      let currentTime = 0;

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
      queueSizeM += totalQueueLength / simulationTime;
    }



    // Средняя длина очереди
    return queueSizeM / simulationNum;
  }

  simulateMG1Queue_LND_NUM_CDF(lambda: number, mu: number, sigma: number, simulationTime: number, queueLimit: number, numSimulations: number): number {
    const queueSizes: number[] = [];

    // Генерация экспоненциального распределения для интервала между заявками
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();

    // Генерация логнормального распределения для времени обслуживания
    const generateServiceTime = () => d3.randomLogNormal(mu, sigma)();

    for (let sim = 0; sim < numSimulations; sim++) {
      let currentTime = 0; // Текущее время
      let queue = 0; // Длина очереди
      let serviceEndTime = 0; // Время окончания обслуживания

      // Симуляция
      while (currentTime < simulationTime) {
        const arrivalTime = currentTime + generateInterArrivalTime(); // Время прихода следующей заявки

        if (arrivalTime > simulationTime) {
          break; // Если время прихода заявки больше времени симуляции, завершаем
        }

        const serviceTime = generateServiceTime(); // Время обслуживания заявки

        if (arrivalTime >= serviceEndTime) {
          // Если заявка может быть обслужена немедленно
          serviceEndTime = arrivalTime + serviceTime;
          queue = 0; // Очередь пуста
        } else {
          // Если заявка идет в очередь
          queue++;
          serviceEndTime += serviceTime;
        }

        // Переходим к следующему времени
        currentTime = arrivalTime;
      }

      // Сохраняем размер очереди после завершения симуляции
      queueSizes.push(queue);
    }

    // Сортируем все значения размера очереди
    queueSizes.sort((a, b) => a - b);

    // Находим вероятность того, что размер очереди <= queueLimit
    let count = 0;
    for (let i = 0; i < queueSizes.length; i++) {
      if (queueSizes[i] <= queueLimit) {
        count++;
      }
    }

    // Рассчитываем вероятность
    return count / numSimulations;
  }

  simulateQueue_LND_TIME_M(lambda: number, mu: number, sigma: number, simulationTime: number, simulationNum: number): number {
    let queueSizeM: number = 0;

    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomLogNormal(mu, sigma)();

    for (let sim = 0; sim < simulationNum; sim++) {

      let totalQueueLength = 0;
      let queue = 0; // Текущая длина очереди
      let currentTime = 0;

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
      queueSizeM += totalQueueLength / simulationTime;
    }

    let logNormalMean = Math.exp(mu + (sigma ** 2) / 2);

    // Средняя длина очереди
    return logNormalMean * (queueSizeM / simulationNum);
  }

  simulateMG1Queue_LND_TIME_CDF(
    lambda: number,
    mu: number,
    sigma: number,
    simulationTime: number,
    queueLimit: number,
    numSimulations: number
  ): number {
    const waitTimes: number[] = [];

    // Генерация экспоненциального распределения для интервала между заявками
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();

    // Генерация логнормального распределения для времени обслуживания
    const generateServiceTime = () => d3.randomLogNormal(mu, sigma)();

    for (let sim = 0; sim < numSimulations; sim++) {
      let currentTime = 0; // Текущее время
      let serviceEndTime = 0; // Время окончания обслуживания

      // Симуляция
      while (currentTime < simulationTime) {
        const interArrivalTime = generateInterArrivalTime();
        const arrivalTime = currentTime + interArrivalTime; // Время прихода следующей заявки

        if (arrivalTime > simulationTime) {
          break; // Если время прихода заявки больше времени симуляции, завершаем
        }

        const serviceTime = generateServiceTime(); // Время обслуживания заявки
        const waitTime = Math.max(0, serviceEndTime - arrivalTime); // Время ожидания заявки

        serviceEndTime = Math.max(serviceEndTime, arrivalTime) + serviceTime; // Обновляем время окончания обслуживания
        waitTimes.push(waitTime); // Сохраняем время ожидания
        currentTime = arrivalTime; // Обновляем текущее время
      }
    }

    // Рассчитываем вероятность: доля случаев, когда время ожидания <= queueLimit
    const probability =
      waitTimes.filter((waitTime) => waitTime <= queueLimit).length /
      waitTimes.length;

    return probability;
  }

}
