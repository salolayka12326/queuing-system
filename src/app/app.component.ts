import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  discipline = 'FIFO';
  disciplines = [
    { value: 'FIFO', label: 'First In, First Out' },
    { value: 'LIFO', label: 'Last In, First Out' },
    { value: 'SIRO', label: 'Service In Random Order' },
    { value: 'PS', label: 'Processor Sharing' },
    { value: 'SJF', label: 'Shortest Job First' },
    { value: 'SRT', label: 'Shortest Remaining Time' },
    { value: 'PWA', label: 'Priority with Aging' },
  ];

  distribution = 'ED';
  distributions = [
    { value: 'ED', label: 'Експоненційний розподіл' },
    { value: 'UD', label: 'Рівномірний розподіл' },
    { value: 'ND', label: 'Нормальний розподіл' },
    { value: 'LND', label: 'Логнормальний розподіл' },
    { value: 'GWD', label: 'Розподіл Гнєденко Вейбула' },
    { value: 'PD', label: 'Розподіл Парето' },
    { value: 'CD', label: 'Розподіл Коші' },
  ];
}
