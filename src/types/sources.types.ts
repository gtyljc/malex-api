
// schema of response of each query / mutation
export type ResponseSchema = {
    code: number,
    success: boolean,
    message: string,
    data: any[]
    pagination?: PaginationOutput
}

// allowed methods for working with DB (from Prisma Client API)
export type DBMethod = (
    "findFirst" | 
    "findMany" | 
    "update" |
    "updateMany" | 
    "delete" | 
    "deleteMany" |
    "count" |
    "create"
);

// available resources (models at DB)
export type Resource = (
    "appointment" |
    "work" |
    "siteConfig" |
    "admins"
)

// pagination argument
export type PaginationInput = {
    page: number,
    perPage: number
}

// pagination in response
export type PaginationOutput = {
    total: number,
    pageInfo: {
        hasNextPage: boolean,
        hasPreviousPage: boolean
    }
}

// sort argument
export type SortInput = {
    field: string,
    order: "ASC" | "DESC"
}
