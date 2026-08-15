import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly router = inject(Router);

  protected readonly title = signal('FitnessApp');
  protected readonly showNav = signal(false);

  ngOnInit() {
    this.updateShowNav(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateShowNav(event.urlAfterRedirects));
  }

  private updateShowNav(url: string) {
    this.showNav.set(!url.startsWith('/register'));
  }
}
