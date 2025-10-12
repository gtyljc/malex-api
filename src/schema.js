
export const typeDefs = `#graphql
    type Query {
        works(ids: [ID!], pagination: Pagination): [Work]!
        work(id: ID!): Work!
        appoitments(ids: [ID]!, pagination: Pagination!): [Appointment]!
        appointment(id: ID!): Appointment!
    }

    input Pagination {
        perPage: Int!
        page: Int!
    }

    type Mutation {
        updateWork: updateWorkResponse!
        updateWorks: updateWorksResponse!
    }

    interface MutationResponse {
        code: String!
        success: Boolean!
        message: String
    }

    type updateWorkResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String
        work: Work!
    }

    type updateWorksResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String
        work: [Work]!
    }

    enum BestWayToTouch {
        WHATSAPP
        PHONE
        TEXT
    }

    type Appointment {
        id: Int!
        name: String!
        surname: String!
        address: String!
        job_desc: String!
        bwt: BestWayToTouch!
    }

    enum WorkCategory {
        ASSEMBLING
        MOUNTING
        PLUMBING
    }

    type Work {
        id: Int!
        img_urls: [String]!
        img_id: ID!
        category: WorkCategory!
    }
`;