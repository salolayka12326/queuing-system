import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinearChartComponent } from './linear-chart.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatSliderModule} from "@angular/material/slider";



@NgModule({
  declarations: [
    LinearChartComponent
  ],
  exports: [
    LinearChartComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSliderModule
  ]
})
export class LinearChartModule { }
