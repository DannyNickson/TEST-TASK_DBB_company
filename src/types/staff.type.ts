import { HydratedDocument } from 'mongoose';

export type Staff = {
  name: string;
  joinDate: Date;
  baseSalary: number;
  type: 'emploee' | 'manager' | 'sales';
  subordinates: Staff[];
};

export type StaffDocument = HydratedDocument<Staff>;
