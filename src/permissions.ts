
// hierarchy of roles and their permissions

import * as types from "./types";

const GUEST_PERMISSIONS: types.Permissions = {
    role: "GUEST",
    permissions: [
        // all top GraphQL fields that can "GUEST" access
        
        "createAT",
        "busyTimesAtDay",
        "busyDaysAtMonth",
        "isDayBusy",
        "contactData",
        "adminLogin",
        "getWorks",
        "newWorks"
    ]
}

const USER_PERMISSIONS: types.Permissions = {
    role: "USER",
    permissions: [
        // all top GraphQL fields that can "USER" access

        
    ].concat(GUEST_PERMISSIONS.permissions)
}

const ADMIN_PERMISSIONS: types.Permissions = {
    role: "ADMIN",
    permissions: [
        // all top GraphQL fields that can only "ADMIN" access
        
        // appointment model
        "appointment",
        "appointments",
        "updateAppointment",
        "updateManyAppointments",
        "createAppointment",

        // siteConfig model
        "siteConfig",
        "updateSiteConfig",

        // work model
        "work",
        "works",
        "updateWork",
        "updateManyWorks",
        "deleteWork",
        "deleteManyWorks",
        "createWork",

        // image upload
        "startImageUpload",
        "finalizeImageUpload",

        // admin panel
        "adminLogout"

    ].concat(USER_PERMISSIONS.permissions)
}

const SUPERUSER_PERMISSIONS: types.Permissions = {
    role: "SUPERUSER",
    permissions: [
        // all top GraphQL fields that can "SUPERUSER" access
        
        "createRT"

    ].concat(ADMIN_PERMISSIONS.permissions)
}

const SUPERADMIN_PERMISSIONS: types.Permissions = {
    role: "SUPERADMIN",
    permissions: [
        // all top GraphQL fields that can only "SUPERADMIN" access
        
    ].concat(ADMIN_PERMISSIONS.permissions)
}

export function hasPermission(role: types.Roles, fieldName: string){
    const rolePerms = [
        GUEST_PERMISSIONS,
        USER_PERMISSIONS,
        SUPERUSER_PERMISSIONS,
        ADMIN_PERMISSIONS,
        SUPERADMIN_PERMISSIONS
    ]

    for (let perm of rolePerms.filter(e => e.role == role)){
        if (perm.permissions.includes(fieldName)) return true;
    }

    return false;
}