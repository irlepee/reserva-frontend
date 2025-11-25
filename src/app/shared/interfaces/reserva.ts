export interface Reserva {
  id: number;
  id_owner: number;
  id_resource: number;
  start_date: string;
  end_date: string;
  status: string;
  id_group?: number | null;
  created_at: string;
}
