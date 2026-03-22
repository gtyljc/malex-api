
// hierarchy of roles and their permissions

import * as types from "./lib/types";
import execSchema from "./schema";
import { GraphQLSchema } from 'graphql'
import { getDirective, mapSchema, MapperKind } from '@graphql-tools/utils'

const fieldsByAuthDirective = (schema: GraphQLSchema, sourceRole: string): string[] => {
    const out: string[] = [];

    mapSchema(
        schema,
        {
            [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
                const directive = getDirective(schema, fieldConfig, "auth")?.[0];
                
                if (directive) {
                    const { role } = directive;
                    
                    if(role == sourceRole){
                        out.push(fieldConfig.astNode?.name.value!);
                    }
                }

                return fieldConfig
            },
        }
    )

    return out
}

class Permissions {
    role: types.RoleEnum;
    fieldsOn: string[]; // in schema
    basePermissions: string[]; // other permissions
    spreadingOn: string[]; // fieldsOn + basePermissions

    // basePermissions is permissions that role accepted from
    // other ( for example USER has accepted permissions from GUEST )

    constructor(role: types.RoleEnum, basePermissions: string[] = []){
        this.role = role;
        this.basePermissions = basePermissions;
        this.fieldsOn = fieldsByAuthDirective(execSchema, role);
        this.spreadingOn = this.fieldsOn.concat(basePermissions)
    }

    hasAccess(fieldName: string): boolean {
        return this.spreadingOn.filter(e => e == fieldName).length == 1;
    }
}

class GuestPermissions extends Permissions {
    constructor(){
        super(types.RoleEnum.Guest);
    }
}

class UserPermissions extends Permissions {
    constructor(guestPermissions: string[]){
        super(types.RoleEnum.User, guestPermissions);
    }
}

class AdminPermissions extends Permissions {
    constructor(userPermissions: string[]){
        super(types.RoleEnum.Admin, userPermissions);
    }
}

class SuperAdminPermissions extends Permissions {
    constructor(adminPermissions: string[]){
        super(types.RoleEnum.Superadmin, adminPermissions);
    }
}

class SuperUserPermissions extends Permissions {
    constructor(superAdminPermissions: string[]){
        super(types.RoleEnum.Superuser, superAdminPermissions)
    }

}

const GUEST_PERMISSIONS = new GuestPermissions();
const USER_PERMISSIONS = new UserPermissions(GUEST_PERMISSIONS.spreadingOn);
const ADMIN_PERMISSIONS = new AdminPermissions(USER_PERMISSIONS.spreadingOn);
const SUPERADMIN_PERMISSIONS = new SuperAdminPermissions(ADMIN_PERMISSIONS.spreadingOn);
const SUPERUSER_PERMISSIONS = new SuperUserPermissions(SUPERADMIN_PERMISSIONS.spreadingOn);
const CORRESPONDS: Record<types.RoleEnum, Permissions> = {
    [ types.RoleEnum.Guest ]: GUEST_PERMISSIONS,
    [ types.RoleEnum.User ]: USER_PERMISSIONS,
    [ types.RoleEnum.Admin ]: ADMIN_PERMISSIONS,
    [ types.RoleEnum.Superadmin ]: SUPERADMIN_PERMISSIONS,
    [ types.RoleEnum.Superuser ]: SUPERUSER_PERMISSIONS
}

export function hasPermission(role: types.RoleEnum, fieldName: string): boolean {
    return CORRESPONDS[role].hasAccess(fieldName);
}