import { RootState } from '../../store';

export const selectDashboardKpis = (state: RootState) => state.dashboards.kpis;
export const selectDashboardActivity = (state: RootState) => state.dashboards.activity;
export const selectDashboardChart = (state: RootState) => state.dashboards.chart;
export const selectDashboardError = (state: RootState) => state.dashboards.errorMessage;
