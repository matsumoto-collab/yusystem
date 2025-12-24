import { User, UserRole } from '@/types/user';

// Role-based permissions configuration
const ROLE_PERMISSIONS = {
    admin: {
        projects: ['view', 'create', 'edit', 'delete'],
        estimates: ['view', 'create', 'edit', 'delete'],
        invoices: ['view', 'create', 'edit', 'delete'],
        customers: ['view', 'create', 'edit', 'delete'],
        settings: ['view', 'create', 'edit', 'delete'],
        users: ['view', 'create', 'edit', 'delete'],
    },
    manager: {
        projects: ['view', 'create', 'edit', 'delete'],
        estimates: ['view', 'create', 'edit', 'delete'],
        invoices: ['view', 'create', 'edit', 'delete'],
        customers: ['view', 'create', 'edit', 'delete'],
        settings: ['view'],
        users: [],
    },
    user: {
        projects: ['view', 'edit'], // Only assigned projects
        estimates: ['view', 'create', 'edit'],
        invoices: ['view'],
        customers: ['view'],
        settings: [],
        users: [],
    },
    viewer: {
        projects: ['view'],
        estimates: ['view'],
        invoices: ['view'],
        customers: ['view'],
        settings: [],
        users: [],
    },
} as const;

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
    user: User | null | undefined,
    resource: string,
    action: 'view' | 'create' | 'edit' | 'delete'
): boolean {
    if (!user || !user.isActive) return false;

    const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
    if (!rolePermissions) return false;

    const resourcePermissions = rolePermissions[resource as keyof typeof rolePermissions] as readonly string[] | undefined;
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
}

/**
 * Check if a user can access a specific project
 */
export function canAccessProject(
    user: User | null | undefined,
    projectId: string
): boolean {
    if (!user || !user.isActive) return false;

    // Admin and Manager can access all projects
    if (user.role === 'admin' || user.role === 'manager') return true;

    // Regular users can only access assigned projects
    if (user.role === 'user') {
        if (!user.assignedProjects) return false;
        return user.assignedProjects.includes(projectId);
    }

    // Viewers can view all projects
    if (user.role === 'viewer') return true;

    return false;
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
    return user?.role === 'admin' && user?.isActive === true;
}

/**
 * Check if a user can manage other users
 */
export function canManageUsers(user: User | null | undefined): boolean {
    return isAdmin(user);
}

/**
 * Get all permissions for a user's role
 */
export function getRolePermissions(role: UserRole) {
    return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || {};
}
