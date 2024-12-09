import {Injectable} from '@angular/core';
import * as d3 from 'd3-random'
@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  constructor() {
  }

  calculateQueueLength_FIFO_ED_NUM_M(lambda: number, mu: number): number {
    let rho = lambda/mu;
    let res = Math.pow(rho, 2) / (1 - rho);
    return res < 0 ? 0 : res;
  }

  calculateQueueLength_FIFO_ED_TIME_M(lambda: number, mu: number): number {
    let rho = lambda/mu;
    let res = rho/(mu*(1-rho));
    return res < 0 ? 0 : res;
  }

  calculateQueueLength_FIFO_ED_GENERATED_NUM_M(
    lambda: number,
    mu: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let queueSizeM: number = 0;

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomExponential(mu)();

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

  calculateQueueLength_FIFO_ED_GENERATED_TIME_M(
    lambda: number,
    mu: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let totalWaitTime = 0;
    let totalServedJobs = 0;

    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomExponential(mu)();

    for (let sim = 0; sim < simulationNum; sim++) {
      let currentTime = 0;
      let serviceEndTime = 0;
      const waitTimes: number[] = [];

      while (currentTime < simulationTime) {
        const arrivalTime = currentTime + generateInterArrivalTime();

        if (arrivalTime > simulationTime) {
          break;
        }

        const serviceTime = generateServiceTime();

        if (arrivalTime >= serviceEndTime) {
          serviceEndTime = arrivalTime + serviceTime;
          waitTimes.push(0); // Ожидания нет
        } else {
          const waitTime = serviceEndTime - arrivalTime;
          waitTimes.push(waitTime);
          serviceEndTime += serviceTime;
        }

        currentTime = arrivalTime;
      }

      totalWaitTime += waitTimes.reduce((sum, wt) => sum + wt, 0);
      totalServedJobs += waitTimes.length;
    }

    return totalWaitTime / totalServedJobs;  }

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

  simulateQueue_GWD_NUM_M(
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

  simulateQueue_UD_NUM_M(
    lambda: number,
    min: number,
    max: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let queueSizeM: number = 0;

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomUniform(min, max)();

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

  simulateQueue_UD_TIME_M(
    lambda: number,
    min: number,
    max: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let totalWaitTime = 0; // Суммарное время ожидания всех заявок
    let totalServedJobs = 0; // Общее количество обслуженных заявок

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomUniform(min, max)();

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

  simulateQueue_BD_NUM_M(
    lambda: number,
    alpha: number,
    beta: number,
    min: number,
    max: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let queueSizeM: number = 0;

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomBeta(alpha, beta)() * (max-min) + min;

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

  simulateQueue_BD_TIME_M(
    lambda: number,
    alpha: number,
    beta: number,
    min: number,
    max: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let totalWaitTime = 0; // Суммарное время ожидания всех заявок
    let totalServedJobs = 0; // Общее количество обслуженных заявок

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomBeta(alpha, beta)() * (max-min) + min;

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

  simulateQueue_PD_NUM_M(
    lambda: number,
    alpha: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let queueSizeM: number = 0;

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomPareto(alpha)();

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

  simulateQueue_PD_TIME_M(
    lambda: number,
    alpha: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let totalWaitTime = 0; // Суммарное время ожидания всех заявок
    let totalServedJobs = 0; // Общее количество обслуженных заявок

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomPareto(alpha)();

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

  simulateQueue_FB_PD_NUM_M(
    lambda: number,
    alpha: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomPareto(alpha)();

    let totalQueueLength = 0; // Сумарна довжина черги
    let totalTime = 0; // Сумарний час симуляції

    for (let sim = 0; sim < simulationNum; sim++) {
      let currentTime = 0; // Поточний час симуляції
      const queue: Array<{ arrivalTime: number; serviceTimeLeft: number }> = []; // Черга заявок

      while (currentTime < simulationTime) {
        // Генеруємо час до наступної заявки
        const interArrivalTime = generateInterArrivalTime();
        const nextArrivalTime = currentTime + interArrivalTime;

        // Генеруємо час обслуговування заявки
        const serviceTime = generateServiceTime();

        // Оновлюємо стан системи до моменту надходження заявки
        while (queue.length > 0 && currentTime < nextArrivalTime) {
          // Знаходимо мінімальний залишковий час обслуговування
          const minServiceTime = Math.min(...queue.map(job => job.serviceTimeLeft));

          // Вибираємо всі заявки з мінімальним залишковим часом
          const jobsWithMinServiceTime = queue.filter(job => job.serviceTimeLeft === minServiceTime);

          // Визначаємо час, який можна витратити на ці заявки
          const timeStep = Math.min(
            nextArrivalTime - currentTime,
            minServiceTime / jobsWithMinServiceTime.length
          );

          // Оновлюємо поточний час
          currentTime += timeStep;

          // Обслуговуємо заявки з мінімальним залишковим часом
          jobsWithMinServiceTime.forEach(job => {
            job.serviceTimeLeft -= timeStep * jobsWithMinServiceTime.length;
          });

          // Видаляємо завершені заявки
          queue.forEach((job, index) => {
            if (job.serviceTimeLeft <= 0) queue.splice(index, 1);
          });
        }

        // Якщо поточний час все ще менший за час надходження нової заявки
        currentTime = Math.max(currentTime, nextArrivalTime);

        // Додаємо нову заявку в чергу
        if (currentTime < simulationTime) {
          queue.push({ arrivalTime: currentTime, serviceTimeLeft: serviceTime });
        }

        // Оновлюємо статистику
        totalQueueLength += queue.length * interArrivalTime;
        totalTime += interArrivalTime;
      }
    }

    // Повертаємо середню кількість заявок у черзі
    return totalQueueLength / totalTime;
  }

  simulateQueue_FB_PD_TIME_M(
    lambda: number,
    alpha: number,
    simulationTime: number,
    simulationNum: number
  ): number {
    let totalWaitTime = 0; // Суммарное время ожидания всех заявок
    let totalServedJobs = 0; // Общее количество обслуженных заявок

    // Генераторы распределений
    const generateInterArrivalTime = () => d3.randomExponential(lambda)();
    const generateServiceTime = () => d3.randomPareto(alpha)();

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

}
