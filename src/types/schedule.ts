export interface Schedule {
  id: number;
  schedule_id: string;
  equipment_name: string;
  location: string;
  pm_cycle: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'pending_validation';
  scheduled_date: string;
  progress?: number;
}

export interface ScheduleResponse {
  data: Schedule[];
  meta?: {
    total: number;
    current_page: number;
    last_page: number;
  };
}