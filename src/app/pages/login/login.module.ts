import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';


const MATERIAL = [
  ReactiveFormsModule,
  MatCardModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatFormFieldModule,
]


@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    ...MATERIAL
  ],
  exports: [LoginComponent, ...MATERIAL]
})
export class LoginModule { }
