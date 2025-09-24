// Placeholder role-based authorization middleware
// TODO: Implement proper role checking

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    // TODO: Implement role-based authorization logic
    // For now, just pass through to allow compilation
    next();
  };
};
