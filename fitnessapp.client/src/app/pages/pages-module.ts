import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Home } from './home/home';
import { Leaderboard } from './leaderboard/leaderboard';
import { Register } from './register/register';

@NgModule({
  declarations: [Home, Leaderboard, Register],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class PagesModule {}
