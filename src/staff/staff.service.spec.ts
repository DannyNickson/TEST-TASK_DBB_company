import { Test, TestingModule } from '@nestjs/testing';
import { StaffType } from '../types';
import { StaffService } from './staff.service';

describe('StaffService', () => {
  let service: StaffService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffService],
    }).compile();

    service = module.get<StaffService>(StaffService);
    const user_1 = service.create({name:"user_1",type:"sales"});
    const user_2 = service.create({name:"user_2", type:"manager"});
    const user_3 = service.create({name:"user_3", type:"employee"});
    const user_4 = service.create({name:"user_4", type:"employee"});

  });

  afterEach(()=>{
    const user_1 = service.delete();
    const user_2 = service.delete();
    const user_3 = service.delete();
    const user_4 = service.delete();
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
