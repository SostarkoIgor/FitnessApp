import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { UserService } from './core/services/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  protected readonly title = signal('FitnessApp');
  protected readonly showNav = signal(false);

  ngOnInit() {
    this.updateShowNav(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateShowNav(event.urlAfterRedirects));
  }

  logout() {
    this.userService.clearStoredUserId();
    this.router.navigateByUrl('/register');
  }

  private updateShowNav(url: string) {
    this.showNav.set(!url.startsWith('/register'));
  }
}
