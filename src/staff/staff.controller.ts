import { Controller, Post, Body, Get, Put, Delete, Param } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, SubbordinateDto } from './dto';

@Controller('staff')
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  getAll() {
    return this.staffService.getAll();
  }
  
  @Get('/salary')
  getAllStaffSalary(){
    return this.staffService.getAllCalculatedSalary();
  }

  @Get('/:type')
  getByParam(@Param('type') type: string) {
    return this.staffService.getByParams(type);
  }

  @Get('/salary/:id')
  getSalaryById(@Param('id') id: string) {
    return this.staffService.calculateSalary(id);
  }

  @Post()
  create(@Body() staffDto: CreateStaffDto) {
    return this.staffService.create(staffDto);
  }

  @Put()
  update(@Body() staffDto: UpdateStaffDto) {
    return this.staffService.update(staffDto);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.staffService.delete(id);
  }

  @Put('/subordinate')
  putSubbordinate(@Body() dto: SubbordinateDto) {
    const { managerId, subbordinateId } = dto;
    return this.staffService.addSubordinate(managerId, subbordinateId);
  }

  @Put('/subordinate/remove')
  putSubbordinateRemove(@Body() dto: SubbordinateDto) {
    const { managerId, subbordinateId } = dto;
    return this.staffService.removeSubordinate(managerId, subbordinateId);
  }
}
