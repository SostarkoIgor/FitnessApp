import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, provideRouter } from '@angular/router';

import { ActivityForm } from './activity-form/activity-form';
import { Home } from './home';
import { ProgressionChart } from './progression-chart/progression-chart';
import { RecentActivities } from './recent-activities/recent-activities';
import { SportBreakdown } from './sport-breakdown/sport-breakdown';
import { StatTiles } from './stat-tiles/stat-tiles';
import { SummaryBanner } from './summary-banner/summary-banner';
import { WeeklyChart } from './weekly-chart/weekly-chart';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        Home,
        SummaryBanner,
        StatTiles,
        ProgressionChart,
        SportBreakdown,
        WeeklyChart,
        RecentActivities,
        ActivityForm,
      ],
      imports: [CommonModule, ReactiveFormsModule, RouterModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
