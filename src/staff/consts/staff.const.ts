/**
 * Staff types
 */

export const STAFF_TYPES = {
  employee: 'emploee',
  manager: 'manager',
  sales: 'sales'
};

/**
 * Staff bonus and max persent bonus
 */

export const STAFF_SALARY = {
  employee: {
    bonus: 0.03,
    maxPersentBonus: 0.3,
    bonusSubbordinates: 0
  },
  manager: {
    bonus: 0.05,
    maxPersentBonus: 0.4,
    bonusSubbordinates: 0.005
  },
  sales: {
    bonus: 0.01,
    maxPersentBonus: 0.35,
    bonusSubbordinates: 0.003
  }
};
