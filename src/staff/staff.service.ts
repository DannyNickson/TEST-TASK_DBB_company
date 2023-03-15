// Import necessary modules and types
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StaffDocument, StaffType } from '../types';
import { Staff } from './staff.model';
import { CreateStaffDto, UpdateStaffDto } from './dto';
import { STAFF_SALARY, STAFF_TYPES } from './consts/staff.const';

@Injectable()
export class StaffService {
  constructor(@InjectModel(Staff.name) private staffModel: Model<StaffDocument>) {}
  // Injectable decorator makes the class a provider that can be injected to other modules
  // InjectModel decorator is used to inject the Staff model from the MongoDB database
  // StaffService class contains methods to interact with the Staff model

  /**
   * Get all staff members
   *
   * @returns {Promise<Staff[]>} Promise that resolves with an array of Staff objects
   */
  async getAll(): Promise<Staff[]> {
    return this.staffModel.find().exec();
  }

  /**
   * Get staff members that match given parameters
   *
   * @param {string} type - The type of staff member to retrieve
   * @returns {Promise<Staff[]>} Promise that resolves with an array of Staff objects
   */
  async getByParams(type: string): Promise<Staff[]> {
    return this.staffModel.find({ type }).exec();
  }

  /**
   * Create a new staff member
   *
   * @param {CreateStaffDto} dto - Data to create the new staff member
   * @returns {Promise<StaffType>} Promise that resolves with the created Staff object
   */
  async create(dto: CreateStaffDto): Promise<StaffType> {
    const createdStaff = new this.staffModel(dto);
    return createdStaff.save();
  }

  /**
   * Updates a staff member with the given data
   * @param {UpdateStaffDto} dto - The data to update the staff member with
   * @returns {Promise<Staff>} The updated staff member
   */
  async update(dto: UpdateStaffDto): Promise<Staff> {
    const updatedStaff = await this.staffModel.findByIdAndUpdate(dto.id, dto, {
      new: true
    });
    return updatedStaff;
  }

  /**
   * Deletes a staff member with the given id
   * @param {string} id - The id of the staff member to delete
   * @returns {Promise<Staff>} The deleted staff member
   */
  async delete(id: string): Promise<Staff> {
    const deletedStaff = await this.staffModel.findByIdAndDelete(id);
    return deletedStaff;
  }

  /**
   * Add subordinate to a manager
   *
   * @param {string} managerId - Id of the manager to add subordinate to
   * @param {string} subbordinateId - Id of the employee to add as subordinate
   * @returns {Promise<Staff>} Promise that resolves with the updated Manager object
   */
  async addSubordinate(managerId: string, subbordinateId: string): Promise<Staff> {
    const manager = await this.staffModel.findById(managerId);
    const subbordinate = await this.staffModel.findById(subbordinateId);
    if (manager === subbordinate) {
      throw 'Manager can`t be subbordinate it self';
    }
    if (!manager || !subbordinate) {
      throw 'Manager or employee not found';
    }
    if (manager.type === STAFF_TYPES.employee) {
      throw 'Cannot add subordinate to non-manager employee';
    }
    manager.subordinates.push(subbordinate);
    subbordinate.supervisor = manager;
    const [updatedManager, updatedSubbordinate] = await Promise.all([
      manager.save(),
      subbordinate.save()
    ]);

    return updatedManager;
  }

  /**
   * Remove subordinate from a manager
   *
   * @param {string} managerId - Id of the manager to remove subordinate from
   * @param {string} subbordinateId - Id of the employee to remove as subordinate
   * @returns {Promise<Staff>} Promise that resolves with the updated Manager object
   */
  async removeSubordinate(managerId: string, subbordinateId: string): Promise<Staff> {
    const manager = await this.staffModel.findById(managerId);
    const subbordinate = await this.staffModel.findById(subbordinateId);

    if (!manager || !subbordinate) {
      throw 'Manager or employee not found';
    }
    if (!subbordinate.supervisor || subbordinate.supervisor._id != managerId) {
      throw 'Employee is not subordinate of this manager';
    }

    manager.subordinates = manager.subordinates.filter(
      (subordinate) => subordinate._id != subbordinateId
    );
    subbordinate.supervisor = null;

    const [updatedManager, updatedSubbordinate] = await Promise.all([
      manager.save(),
      subbordinate.save()
    ]);

    return updatedManager;
  }

  /**
   * Calculate salary for staff based on their type, base salary, years worked, and subordinate salaries.
   * @param {String} staffId The ID of the staff member to calculate the salary for.
   * @returns {Promise<number>} The calculated salary for the staff member.
   * @throws {string} Throws an error if no staff member was found with the given ID.
   */
  async calculateSalary(staffId: string): Promise<number> {
    const staffMember = await this.findStaffById(staffId);
    if (!staffMember) {
      throw 'No such staff member with id';
    }
    const { type, baseSalary, joinDate, subordinates } = staffMember;
    const { bonus, maxPersentBonus, bonusSubbordinates } = STAFF_SALARY[type];

    const yearsWorked = new Date().getFullYear() - joinDate.getFullYear();
    const yearsWorkedPercentage = Math.min(bonus * yearsWorked, maxPersentBonus);
    let subordinateSalaries: number[] = [];
    if (type === STAFF_TYPES.sales) {
      subordinateSalaries = await this.getAllSubordinateSalaries(subordinates);
    }
    if (type === STAFF_TYPES.manager) {
      subordinateSalaries = await this.getSubordinatesSalaries(subordinates);
    }
    const subordinateSalaryPercentage =
      bonusSubbordinates * subordinateSalaries.reduce((a, b) => a + b, 0);
    const salary = baseSalary + baseSalary * yearsWorkedPercentage + subordinateSalaryPercentage;
    return salary;
  }

  /**
   * Find staff by id
   * @param {String} id - The id of the staff member to find
   * @returns {Promise<Staff>} A Promise that resolves with the staff member if found, or null if not found
   */
  async findStaffById(id: string): Promise<Staff> {
    return await this.staffModel.findById(id);
  }

  /**
   * Returns all subordinate salaries recursively
   * @param {Staff[]} subordinates An array of subordinate staff members
   * @returns {Promise<number[]>} An array of salaries for all subordinates
   */
  private async getAllSubordinateSalaries(subordinates: Staff[]): Promise<number[]> {
    let salaries: number[] = [];
    await Promise.all(
      subordinates.map(async (subordinate: StaffType) => {
        // Calculate salary for current subordinate
        const salary = await this.calculateSalary(subordinate._id);
        salaries.push(salary);
        // Recursively call this function to get salaries for subordinates of this subordinate
        if (subordinate.subordinates?.length > 0) {
          const subSalaries = await this.getAllSubordinateSalaries(subordinate.subordinates);
          salaries = salaries.concat(subSalaries);
        }
      })
    );
    return salaries;
  }

  /**
   * Returns salaries for direct subordinates only
   * @param {Staff[]} subordinates An array of subordinate staff members
   * @returns {Promise<number[]>} An array of salaries for direct subordinates only
   */
  private async getSubordinatesSalaries(subordinates: Staff[]): Promise<number[]> {
    let salaries: number[] = [];
    await Promise.all(
      subordinates.map(async (subordinate: StaffType) => {
        // Calculate salary for current subordinate
        const salary = await this.calculateSalary(subordinate._id);
        salaries.push(salary);
      })
    );
    return salaries;
  }

  /**
   * Calculates the salary for staff based on their type, base salary, years worked, and subordinate salaries.
   *
   * @returns {Promise<{ staff: Record<string, number>; total: number }>} An object containing the calculated salaries for all staff members and the total salary for all staff members.
   */
  async getAllCalculatedSalary(): Promise<{ staff: Record<string, number>; total: number }> {
    // Retrieves all staff data from the database using the "getAll" method
    const allStaff: Staff[] = await this.getAll();
    // Initializes the response object with empty staff and total salary properties
    const response = { staff: {}, total: 0 };
    // Executes the calculation for all staff members concurrently
    await Promise.all(
      // Maps through each staff member in the "allStaff" array
      allStaff.map(async (staff: StaffType) => {
        // Calculates the salary for the current staff member using their ID
        let salary: number = await this.calculateSalary(staff._id);
        response.staff[staff.name] = salary;
        response['total'] += salary;
      })
    );
    return response;
  }
}
