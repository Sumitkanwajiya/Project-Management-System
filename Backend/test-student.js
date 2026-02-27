import axios from "axios";

async function main() {
    const api = axios.create({ baseURL: "http://localhost:5000/api/v1" });
    let token = null;

    try {
        // 1. Log in as a student
        const res = await api.post("/auth/login", { email: "sumitkanojiya113@gmail.com", password: "password123", role: "Student" });
        const cookie = res.headers["set-cookie"][0];
        const user = res.data.user;
        console.log("Logged in:", user.name);

        api.defaults.headers.Cookie = cookie;

        // 2. Fetch supervisors
        const supRes = await api.get("/student/fetch-supervisors");
        console.log("Supervisors:", supRes.data.data.supervisors.length);

        // 3. Fetch my requests
        const reqRes = await api.get("/student/my-requests");
        console.log("My Requests:", reqRes.data.data.requests.length);

    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
}
main();
