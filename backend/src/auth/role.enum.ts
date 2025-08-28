export enum Role {
  Librarian = 'librarian',
  Admin = 'admin',
  Student = 'student',
  PendingLibrarian = 'pending-librarian',  // ➜ added for librarian approval
}

export const allowedRoles = [
  Role.Librarian,
  Role.Admin,
  Role.Student,
  Role.PendingLibrarian, 
];
