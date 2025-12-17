
// hierarchy of roles and their permissions

import * as types from "./types";

export const USER_PERMISSIONS: types.Permissions = {
    role: "USER",
    permissions: [
        // all top GraphQL fields that can "USER" access
        
        "busyTimesAtDay",
        "busyDaysAtMonth",
        "isDayBusy",
        "contactData",
        "adminLogin",
        "getWorks",
        "newWorks"
    ]
}

export const ADMIN_PERMISSIONS: types.Permissions = {
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
        "finalizeImageUpload"

    ].concat(USER_PERMISSIONS.permissions)
}

export function hasPermission(role: types.Roles, fieldName: string){
    const rolePerms = [
        USER_PERMISSIONS,
        ADMIN_PERMISSIONS
    ]

    for (let perm of rolePerms.filter(e => e.role == role)){
        if (perm.permissions.includes(fieldName)) return true;
    }

    return false;
}