import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class Staff {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: new Date().getTime() })
  joinDate: number;

  @Prop({ default: 500 })
  baseSalary: number;

  @Prop({ default: 'emploee' })
  type: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }] })
  subordinates: Staff[];
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
