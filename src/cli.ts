
import { Command } from "commander";
import { DatabaseSource } from "./sources";
import promt from "prompt-sync";

const program = new Command();
const db = new DatabaseSource();
const promtInput = promt();

class SuperAdminPanel {
    program: Command;
    admin: any;
    db: DatabaseSource;

    constructor(program: Command, db: DatabaseSource){
        this.program = program;
        this.db = db;
    }

    async add(){
        const fullname = promtInput("Enter fullname: ");
        const username = promtInput("Enter username: ");
        const password = promtInput("Enter password: ");
        const email = promtInput("Enter email: ");
        const q = await db.create("admin", { username, password, email, fullname }); // register superadmin in DB

        if (q.errorInstance) console.log(q.errorInstance);

        console.log(`New superadmin ${ username } was added!`)
    }

    async remove(){
        const adminId = promt("Enter ID of superadmin: ")
        const q = await db.deleteById("admin", adminId); // remove superadmin from DB
        
        console.log(typeof q);

        if(q.errorInstance) console.log(q.errorInstance);
        
        console.log("The superadmin was successfully removed!")
    }

    async list(){
        const q = await db.getManyByFilter("admin", { is_super: true });

        q.errorInstance ? console.log(q.errorInstance): 
            console.table(q.qResult);
    }

    init(){

        // add command registration
        program.command("add")
            .description("Adds new superadmin")
            .action( this.add )
        
        // remove command registration
        program.command("remove")
            .description("Removes superadmin")
            .action( this.remove )

        // list command registration
        program.command("list")
            .description("Shows the list of exist superadmins")
            .action( this.list )

        return this;
    }
}

new SuperAdminPanel(program, db).init();

program.parse();