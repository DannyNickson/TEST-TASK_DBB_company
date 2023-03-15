import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StaffService } from './staff.service';
import { StaffDocument } from '../types';
import { Staff } from './staff.model';
import { STAFF_SALARY, STAFF_TYPES } from './consts';

describe('StaffService', () => {
  let service: StaffService;
  let model: Model<StaffDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: getModelToken(Staff.name),
          useValue: {
            new: jest.fn().mockResolvedValue(model),
            constructor: jest.fn().mockResolvedValue(model),
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            save: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<StaffService>(StaffService);
    model = module.get<Model<StaffDocument>>(getModelToken(Staff.name));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('calculateSalary', () => {
    it('should calculate salary for manager with subordinates', async () => {
      const manager = await service.create({
        name: 'Manager',
        type: 'manager',
        baseSalary: 1000,
        joinDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2))
      });
      const subordinates = [];
      for (let i = 1; i <= 3; i++) {
        const subordinate = await service.create({
          name: `Subordinate ${i}`,
          type: 'employee',
          baseSalary: 500,
          joinDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        });
        subordinates.push(subordinate);
        await service.addSubordinate(manager._id, subordinate._id);
      }
      const salary = await service.calculateSalary(manager._id);
      const expectedSalary =
        STAFF_SALARY[STAFF_TYPES.manager] +
        subordinates.length * STAFF_SALARY[STAFF_TYPES.employee] +
        2 * 100 + 
        subordinates.length * subordinates[0].calculateSalary(); // 3 * 550 = 1650

      expect(salary).toEqual(expectedSalary);
    });
  });
});
