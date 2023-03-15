import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Staff, StaffSchema } from './staff.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
  ],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
