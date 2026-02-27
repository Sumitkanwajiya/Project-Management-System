import mongoose from "mongoose";
import { config } from "dotenv";
import User from "./models/user.js";
import SupervisorRequest from "./models/supervisorRequest.js";
import fs from "fs";

config();

mongoose.connect(process.env.MONGO_URI, { dbName: "fyp_management_system" }).then(async () => {
    const teachers = await User.find({ role: { $regex: /^teacher$/i } });
    const supervisors = await User.find({ role: { $regex: /^supervisor$/i } });
    const requests = await SupervisorRequest.find().populate('student').populate('supervisor');

    const out = {
        teachers: teachers.map(t => ({ id: t._id, name: t.name, role: t.role, experties: t.experties })),
        supervisors: supervisors.map(t => ({ name: t.name, role: t.role })),
        requests: requests.map(r => ({ id: r._id, student: r.student?.name, supervisor: r.supervisor?.name, status: r.status }))
    };

    fs.writeFileSync("test-out.json", JSON.stringify(out, null, 2));
    console.log("Done");
    process.exit();
});
