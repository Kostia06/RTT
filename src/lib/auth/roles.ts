import { UserRole } from '@/types';

export const ROLES: Record<string, UserRole> = {
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
};

export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    customer: 1,
    employee: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const isAdmin = (role: UserRole): boolean => role === ROLES.ADMIN;
export const isEmployee = (role: UserRole): boolean => role === ROLES.EMPLOYEE || isAdmin(role);
export const isCustomer = (role: UserRole): boolean => role === ROLES.CUSTOMER;
