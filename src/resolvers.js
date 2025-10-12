
export const resolvers = {
    Query: {
        async works(parent, args, contextValue){
            console.log(args);

            if(args.pagination) {
                console.log(await contextValue.prisma.work.findMany({skip: 1, take: 3}));

                return await contextValue.prisma.work.findMany({skip: 1, take: 3});
            }

            if(args.ids){
                return await contextValue.prisma.appointment.findMany({where: {id: {in: args.ids.map(e => parseInt(e))}}});
            }
        }
    }
}