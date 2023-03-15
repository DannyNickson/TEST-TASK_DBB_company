export class CreateStaffDto{
    readonly name:string;
    readonly joinDate?:Date;
    readonly baseSalary?:number;
    readonly type?:'employee' | 'manager' | 'sales';
    readonly subordinates?:number[];
}