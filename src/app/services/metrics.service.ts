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

  simulateQueue_LND_NUM_M(
    lambda: number,
    mu: number,
    sigma: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let queueSizeM: number = 0;

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomLogNormal(mu, sigma)();

    for (let sim = 0; sim < simulationNum; sim++) {
      let weightedQueueSum = 0; // Взвешенная сумма длины очереди
      let currentTime = 0; // Текущее время
      let serviceEndTime = 0; // Время окончания обслуживания текущей заявки
      let queue = 0; // Текущая длина очереди

      // Симуляция событий
      while (currentTime < simulationTime) {
        const arrivalTime = currentTime + generateInterArrivalTime();

        if (arrivalTime > simulationTime) {
          break; // Остановка, если заявка пришла после времени симуляции
        }

        const serviceTime = generateServiceTime();

        // Учет времени с последнего события
        weightedQueueSum += queue * (arrivalTime - currentTime);

        if (arrivalTime >= serviceEndTime) {
          // Если заявка обслуживается немедленно
          serviceEndTime = arrivalTime + serviceTime;
          queue = 0; // Очередь пуста
        } else {
          // Если заявка идет в очередь
          queue++;
          serviceEndTime += serviceTime;
        }

        // Обновляем текущее время
        currentTime = arrivalTime;
      }

      // Если симуляция завершилась, учитываем остаток времени
      weightedQueueSum += queue * (simulationTime - currentTime);

      // Рассчитываем среднюю длину очереди за эту симуляцию
      queueSizeM += weightedQueueSum / simulationTime;
    }

    // Возвращаем среднюю длину очереди по всем симуляциям
    return queueSizeM / simulationNum;
  }


  simulateMG1Queue_LND_NUM_CDF(
    lambda: number,
    mu: number,
    sigma: number,
    simulationTime: number,
    queueLimit: number,
    numSimulations: number
  ): number {
    let totalBelowLimitTime = 0; // Общее время, когда очередь <= queueLimit
    let totalSimulatedTime = 0; // Суммарное время всех симуляций

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomLogNormal(mu, sigma)();

    for (let sim = 0; sim < numSimulations; sim++) {
      let currentTime = 0; // Текущее время
      let serviceEndTime = 0; // Время окончания обслуживания
      let queue = 0; // Текущая длина очереди

      while (currentTime < simulationTime) {
        const arrivalTime = currentTime + generateInterArrivalTime();

        if (arrivalTime > simulationTime) {
          // Учёт остатка времени до конца симуляции
          const remainingTime = simulationTime - currentTime;
          if (queue <= queueLimit) {
            totalBelowLimitTime += remainingTime;
          }
          totalSimulatedTime += remainingTime;
          break;
        }

        const serviceTime = generateServiceTime();

        // Учёт времени с момента последнего события
        const elapsedTime = arrivalTime - currentTime;
        if (queue <= queueLimit) {
          totalBelowLimitTime += elapsedTime;
        }
        totalSimulatedTime += elapsedTime;

        // Обновление состояния системы
        if (arrivalTime >= serviceEndTime) {
          serviceEndTime = arrivalTime + serviceTime;
          queue = 0; // Очередь пуста
        } else {
          queue++;
          serviceEndTime += serviceTime;
        }

        currentTime = arrivalTime;
      }
    }

    // Вероятность того, что очередь <= queueLimit
    return totalBelowLimitTime / totalSimulatedTime;
  }

  simulateQueue_LND_TIME_M(
    lambda: number,
    mu: number,
    sigma: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let totalWaitTime = 0; // Суммарное время ожидания всех заявок
    let totalServedJobs = 0; // Общее количество обслуженных заявок

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomLogNormal(mu, sigma)();

    for (let sim = 0; sim < simulationNum; sim++) {
      let currentTime = 0; // Текущее время
      let serviceEndTime = 0; // Время окончания обслуживания текущей заявки
      const waitTimes: number[] = []; // Список времени ожидания для всех заявок

      while (currentTime < simulationTime) {
        const arrivalTime = currentTime + generateInterArrivalTime();

        if (arrivalTime > simulationTime) {
          break; // Если заявка пришла после окончания симуляции
        }

        const serviceTime = generateServiceTime();

        if (arrivalTime >= serviceEndTime) {
          // Если заявка обслуживается немедленно
          serviceEndTime = arrivalTime + serviceTime;
          waitTimes.push(0); // Ожидания нет
        } else {
          // Если заявка идет в очередь
          const waitTime = serviceEndTime - arrivalTime; // Время ожидания этой заявки
          waitTimes.push(waitTime);
          serviceEndTime += serviceTime;
        }

        // Обновляем текущее время
        currentTime = arrivalTime;
      }

      // Суммируем время ожидания и количество заявок
      totalWaitTime += waitTimes.reduce((sum, wt) => sum + wt, 0);
      totalServedJobs += waitTimes.length;
    }

    // Рассчитываем среднее время ожидания
    return totalWaitTime / totalServedJobs;
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
    const probability = waitTimes.filter((waitTime) => waitTime <= queueLimit).length / waitTimes.length;

    return probability;
  }

  simulateQueue_GWM_NUM_M(
    lambda: number,
    scale: number,
    shape: number,
    location: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let queueSizeM: number = 0;

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomWeibull(shape, location, scale)();

    for (let sim = 0; sim < simulationNum; sim++) {
      let weightedQueueSum = 0; // Взвешенная сумма длины очереди
      let currentTime = 0; // Текущее время
      let serviceEndTime = 0; // Время окончания обслуживания текущей заявки
      let queue = 0; // Текущая длина очереди

      // Симуляция событий
      while (currentTime < simulationTime) {
        const arrivalTime = currentTime + generateInterArrivalTime();

        if (arrivalTime > simulationTime) {
          break; // Остановка, если заявка пришла после времени симуляции
        }

        const serviceTime = generateServiceTime();

        // Учет времени с последнего события
        weightedQueueSum += queue * (arrivalTime - currentTime);

        if (arrivalTime >= serviceEndTime) {
          // Если заявка обслуживается немедленно
          serviceEndTime = arrivalTime + serviceTime;
          queue = 0; // Очередь пуста
        } else {
          // Если заявка идет в очередь
          queue++;
          serviceEndTime += serviceTime;
        }

        // Обновляем текущее время
        currentTime = arrivalTime;
      }

      // Если симуляция завершилась, учитываем остаток времени
      weightedQueueSum += queue * (simulationTime - currentTime);

      // Рассчитываем среднюю длину очереди за эту симуляцию
      queueSizeM += weightedQueueSum / simulationTime;
    }

    // Возвращаем среднюю длину очереди по всем симуляциям
    return queueSizeM / simulationNum;
  }

  simulateMG1Queue_GWD_NUM_CDF(
    lambda: number,
    scale: number,
    shape: number,
    location: number,
    simulationTime: number,
    queueLimit: number,
    numSimulations: number
  ): number {
    let totalBelowLimitTime = 0; // Общее время, когда очередь <= queueLimit
    let totalSimulatedTime = 0; // Суммарное время всех симуляций

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomWeibull(shape, location, scale)();

    for (let sim = 0; sim < numSimulations; sim++) {
      let currentTime = 0; // Текущее время
      let serviceEndTime = 0; // Время окончания обслуживания
      let queue = 0; // Текущая длина очереди

      while (currentTime < simulationTime) {
        const arrivalTime = currentTime + generateInterArrivalTime();

        if (arrivalTime > simulationTime) {
          // Учёт остатка времени до конца симуляции
          const remainingTime = simulationTime - currentTime;
          if (queue <= queueLimit) {
            totalBelowLimitTime += remainingTime;
          }
          totalSimulatedTime += remainingTime;
          break;
        }

        const serviceTime = generateServiceTime();

        // Учёт времени с момента последнего события
        const elapsedTime = arrivalTime - currentTime;
        if (queue <= queueLimit) {
          totalBelowLimitTime += elapsedTime;
        }
        totalSimulatedTime += elapsedTime;

        // Обновление состояния системы
        if (arrivalTime >= serviceEndTime) {
          serviceEndTime = arrivalTime + serviceTime;
          queue = 0; // Очередь пуста
        } else {
          queue++;
          serviceEndTime += serviceTime;
        }

        currentTime = arrivalTime;
      }
    }

    // Вероятность того, что очередь <= queueLimit
    return totalBelowLimitTime / totalSimulatedTime;
  }

  simulateQueue_GWD_TIME_M(
    lambda: number,
    scale: number,
    shape: number,
    location: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let totalWaitTime = 0; // Суммарное время ожидания всех заявок
    let totalServedJobs = 0; // Общее количество обслуженных заявок

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomWeibull(shape, location, scale)();

    for (let sim = 0; sim < simulationNum; sim++) {
      let currentTime = 0; // Текущее время
      let serviceEndTime = 0; // Время окончания обслуживания текущей заявки
      const waitTimes: number[] = []; // Список времени ожидания для всех заявок

      while (currentTime < simulationTime) {
        const arrivalTime = currentTime + generateInterArrivalTime();

        if (arrivalTime > simulationTime) {
          break; // Если заявка пришла после окончания симуляции
        }

        const serviceTime = generateServiceTime();

        if (arrivalTime >= serviceEndTime) {
          // Если заявка обслуживается немедленно
          serviceEndTime = arrivalTime + serviceTime;
          waitTimes.push(0); // Ожидания нет
        } else {
          // Если заявка идет в очередь
          const waitTime = serviceEndTime - arrivalTime; // Время ожидания этой заявки
          waitTimes.push(waitTime);
          serviceEndTime += serviceTime;
        }

        // Обновляем текущее время
        currentTime = arrivalTime;
      }

      // Суммируем время ожидания и количество заявок
      totalWaitTime += waitTimes.reduce((sum, wt) => sum + wt, 0);
      totalServedJobs += waitTimes.length;
    }

    // Рассчитываем среднее время ожидания
    return totalWaitTime / totalServedJobs;
  }

  simulateMG1Queue_GWD_TIME_CDF(
    lambda: number,
    scale: number,
    shape: number,
    location: number,
    simulationTime: number,
    queueLimit: number,
    numSimulations: number
  ): number {
    const waitTimes: number[] = [];

    // Генерация экспоненциального распределения для интервала между заявками
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();

    // Генерация логнормального распределения для времени обслуживания
    const generateServiceTime = () => d3.randomWeibull(shape, location, scale)();

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
    const probability = waitTimes.filter((waitTime) => waitTime <= queueLimit).length / waitTimes.length;

    return probability;
  }

}
