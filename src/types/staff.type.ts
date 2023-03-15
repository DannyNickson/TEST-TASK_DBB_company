import { HydratedDocument, ObjectId } from 'mongoose';

export type StaffType = {
  _id: string;
  name: string;
  joinDate: Date;
  baseSalary: number;
  type: 'employee' | 'manager' | 'sales';
  subordinates: StaffType[];
  supervisor: StaffType;
};

export type StaffDocument = HydratedDocument<StaffType>;
