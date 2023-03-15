export class UpdateStaffDto {
  readonly id: string;
  readonly name?: string;
  readonly joinDate?: Date;
  readonly baseSalary?: number;
  readonly type?: 'emploee' | 'manager' | 'sales';
  readonly subordinates?: number[];
}
