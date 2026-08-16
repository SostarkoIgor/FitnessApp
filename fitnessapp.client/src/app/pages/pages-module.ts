import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Home } from './home/home';
import { Leaderboard } from './leaderboard/leaderboard';
import { Register } from './register/register';
import { ActivityCalendar } from './home/activity-calendar/activity-calendar';
import { ActivityForm } from './home/activity-form/activity-form';
import { ProgressionChart } from './home/progression-chart/progression-chart';
import { RecentActivities } from './home/recent-activities/recent-activities';
import { SportBreakdown } from './home/sport-breakdown/sport-breakdown';
import { SportDetail } from './home/sport-detail/sport-detail';
import { SportStats } from './home/sport-stats/sport-stats';
import { StatTiles } from './home/stat-tiles/stat-tiles';
import { SummaryBanner } from './home/summary-banner/summary-banner';
import { WeeklyChart } from './home/weekly-chart/weekly-chart';

@NgModule({
  declarations: [
    Home,
    Leaderboard,
    Register,
    SummaryBanner,
    StatTiles,
    ProgressionChart,
    SportBreakdown,
    SportDetail,
    WeeklyChart,
    RecentActivities,
    ActivityForm,
    ActivityCalendar,
    SportStats,
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class PagesModule {}
