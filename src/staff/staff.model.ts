/**
 * IMPORTS
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

/**
 * Staff Schema
 *
 * @class Staff - Represents a staff member
 * @prop {String} name - The name of the staff member (required, unique)
 * @prop {Date} joinDate - The date the staff member joined (defaults to current date)
 * @prop {number} baseSalary - The staff member's base salary (defaults to 500)
 * @prop {String} type - The type of staff member (defaults to 'employee')
 * @prop {Staff[]} subordinates - An array of subordinates of this staff member
 * @prop {Staff} supervisor - The supervisor of this staff member (reference to another staff member)
 */

@Schema()
export class Staff {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: new Date() })
  joinDate: Date;

  @Prop({ default: 500 })
  baseSalary: number;

  @Prop({ default: 'employee' })
  type: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }] })
  subordinates: Staff[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Staff', allowNull: true })
  supervisor: Staff;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
