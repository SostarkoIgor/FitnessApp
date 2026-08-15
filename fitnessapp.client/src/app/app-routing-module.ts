import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth-guard';
import { Home } from './pages/home/home';
import { Leaderboard } from './pages/leaderboard/leaderboard';
import { Register } from './pages/register/register';

const routes: Routes = [
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'leaderboard', component: Leaderboard, canActivate: [authGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
