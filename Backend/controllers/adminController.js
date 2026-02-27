import asyncHandler from "../middleware/asyncHandler.js";
import { ErrorHandler } from "../middleware/error.js";
import User from "../models/user.js";
import Project from "../models/project.js";
import SupervisorRequest from "../models/supervisorRequest.js";
import * as projectService from "../services/projectService.js";
import * as userServices from "../services/userService.js";
import * as notificationService from "../services/notificationService.js";


export const createStudent = asyncHandler(async (req, res, next) => {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new ErrorHandler("User already exists", 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        department,
        role: "Student"
    });

    res.status(201).json({
        success: true,
        message: "Student created successfully",
        user
    });
});

export const updateStudent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, department, password } = req.body;

    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role.toLowerCase() !== "student") {
        return next(new ErrorHandler("User is not a student", 400));
    }

    const updateData = { name, email, department };
    if (password) {
        user.password = password;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.department = department || user.department;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        user
    });
});
export const deleteStudent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role.toLowerCase() !== "student") {
        return next(new ErrorHandler("User is not a Student", 400));
    }

    // 1. Delete associated Project
    await Project.deleteMany({ student: id });

    // 2. Delete associated SupervisorRequests
    await SupervisorRequest.deleteMany({ student: id });

    // 3. Remove student from Teacher's assignedStudents list if they have a supervisor
    if (user.supervisor) {
        await User.findByIdAndUpdate(user.supervisor, {
            $pull: { assignedStudents: id }
        });
    }

    // 4. Finally delete the student user
    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: "Student deleted successfully"
    });
});

export const getStudentById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

export const createTeacher = asyncHandler(async (req, res, next) => {
    const { name, email, password, department, experties, maxStudents } = req.body;

    if (!name || !email || !password || !department || !experties || !maxStudents) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new ErrorHandler("User already exists", 400));
    }

    // Handle experties parsing if string
    const expertiesArray = Array.isArray(experties) ?
        experties : typeof experties === "string" && experties.trim() !== "" ?
            experties.split(",").map((exp) => exp.trim()) : [];

    const user = await User.create({
        name,
        email,
        password,
        department,
        role: "Teacher",
        experties: expertiesArray,
        maxStudents
    });

    res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        user
    });
});

export const updateTeacher = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, department, experties, maxStudents } = req.body;

    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role.toLowerCase() !== "teacher") {
        return next(new ErrorHandler("User is not a Teacher", 400));
    }

    // Handle experties parsing if string
    if (experties) {
        const expertiesArray = Array.isArray(experties) ?
            experties : typeof experties === "string" && experties.trim() !== "" ?
                experties.split(",").map((exp) => exp.trim()) : [];
        user.experties = expertiesArray;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.department = department || user.department;
    user.maxStudents = maxStudents || user.maxStudents;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Teacher updated successfully",
        user
    });

});

export const deleteTeacher = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role.toLowerCase() !== "teacher") {
        return next(new ErrorHandler("User is not a Teacher", 400));
    }

    // 1. Delete all SupervisorRequests directed at this teacher
    await SupervisorRequest.deleteMany({ supervisor: id });

    // 2. Unassign this teacher from all Students
    await User.updateMany(
        { supervisor: id },
        { $set: { supervisor: null } }
    );

    // 3. Unassign this teacher from all Projects
    await Project.updateMany(
        { supervisor: id },
        { $set: { supervisor: null, status: "Pending" } } // Optional: reset status to pending since they lost their supervisor
    );

    // 4. Finally delete the teacher user
    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: "Teacher deleted successfully"
    });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
    // Exclude users with role "Admin" or "admin" (case-insensitive check simulation using $nin)
    const users = await User.find({ role: { $nin: ["Admin", "admin"] } })
        .populate("supervisor", "name email")
        .populate("project", "title status");

    res.status(200).json({
        success: true,
        message: "All users fetched successfully",
        data: { users }
    });
});

export const getAllProjects = asyncHandler(async (req, res, next) => {
    const { projects } = await projectService.getAllProjects();
    res.status(200).json({
        success: true,
        message: "All projects fetched successfully",
        data: { projects }
    });
});


export const getDashboardStats = asyncHandler(async (req, res, next) => {

    const totalStudents = await User.countDocuments({ role: "Student" });
    const totalTeachers = await User.countDocuments({ role: "Teacher" });
    const totalProjects = await Project.countDocuments();
    // Count distinct supervisors (teachers assigned to projects)
    const distinctSupervisors = await Project.distinct("supervisor", { supervisor: { $ne: null } });
    const totalSupervisors = distinctSupervisors.length;

    const pendingRequests = await SupervisorRequest.countDocuments({ status: "Pending" });
    const completeProjects = await Project.countDocuments({ status: "Completed" });
    const pendingProjects = await Project.countDocuments({ status: "Pending" });

    // Active Projects (Approved)
    const activeProjects = await Project.countDocuments({ status: "Approved" });

    // Nearby Deadlines (next 14 days, not completed or rejected)
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    const nearbyDeadlines = await Project.countDocuments({
        status: { $nin: ["Completed", "Rejected"] },
        deadline: {
            $gte: new Date(),
            $lte: twoWeeksFromNow
        }
    });


    res.status(200).json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        data: {
            totalStudents,
            totalTeachers,
            totalProjects,
            totalSupervisors,
            pendingRequests,
            completeProjects,
            pendingProjects,
            activeProjects,
            nearbyDeadlines
        }
    });
});


export const assignSupervisor = asyncHandler(async (req, res, next) => {
    const { studentId, supervisorId } = req.body;

    if (!studentId || !supervisorId) {
        return next(new ErrorHandler("Please provide studentId and supervisorId", 400));
    }
    const project = await Project.findOne({ student: studentId });

    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }

    if (project.supervisor !== null) {
        return next(new ErrorHandler("Supervisor already assigned", 400));
    }

    if (project.status !== "Approved") {
        return next(new ErrorHandler("Project not approved yet", 400));
    } else if (project.status === "Rejected" || project.status === "Pending") {
        return next(new ErrorHandler("Project is in pending State or rejected", 400));
    }

    const { student, supervisor } = await userServices.assignSupervisorDirectly(studentId, supervisorId);

    project.supervisor = supervisor;
    await project.save();

    await notificationService.notifyUser(
        studentId,
        `Your project has been assigned to supervisor ${supervisor.name}`,
        "Approval",
        `/project/${project._id}`,
        "Low"
    );

    await notificationService.notifyUser(
        supervisorId,
        `You have been assigned to supervise project ${project.title}`,
        "General",
        `/project/${project._id}`,
        "Low"
    );

    res.status(200).json({
        success: true,
        message: "Supervisor assigned successfully",
        data: {
            project,
            student,
            supervisor
        }
    });
});

// Get all pending supervisor requests
export const getPendingSupervisorRequests = asyncHandler(async (req, res, next) => {
    const requests = await SupervisorRequest.find({ status: "Pending" })
        .populate("student", "name email department")
        .populate("supervisor", "name email department experties")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: "Pending supervisor requests fetched successfully",
        data: requests
    });
});

// Approve supervisor request
export const approveSupervisorRequest = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const request = await SupervisorRequest.findById(id)
        .populate("student", "name email")
        .populate("supervisor", "name email");

    if (!request) {
        return next(new ErrorHandler("Request not found", 404));
    }

    if (request.status !== "Pending") {
        return next(new ErrorHandler("Request already processed", 400));
    }

    // Check if student already has a supervisor
    const student = await User.findById(request.student._id);
    if (student.supervisor) {
        return next(new ErrorHandler("Student already has a supervisor", 400));
    }

    // Assign supervisor using existing service
    const { student: updatedStudent, supervisor: updatedSupervisor } = await userServices.assignSupervisorDirectly(
        request.student._id,
        request.supervisor._id
    );

    // Update project if exists
    const project = await Project.findOne({ student: request.student._id });
    if (project) {
        project.supervisor = request.supervisor._id;
        await project.save();
    }

    // Update request status
    request.status = "Approved";
    await request.save();

    // Send notifications
    await notificationService.notifyUser(
        request.student._id,
        `Your supervisor request for ${request.supervisor.name} has been approved`,
        "Approval",
        project ? `/project/${project._id}` : "/student/status",
        "High"
    );

    await notificationService.notifyUser(
        request.supervisor._id,
        `You have been assigned to supervise ${request.student.name}`,
        "General",
        project ? `/project/${project._id}` : "/teacher/status",
        "Medium"
    );

    res.status(200).json({
        success: true,
        message: "Supervisor request approved successfully",
        data: request
    });
});

// Reject supervisor request
export const rejectSupervisorRequest = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await SupervisorRequest.findById(id)
        .populate("student", "name email")
        .populate("supervisor", "name email");

    if (!request) {
        return next(new ErrorHandler("Request not found", 404));
    }

    if (request.status !== "Pending") {
        return next(new ErrorHandler("Request already processed", 400));
    }

    // Update request status
    request.status = "Rejected";
    await request.save();

    // Send notification to student
    await notificationService.notifyUser(
        request.student._id,
        `Your supervisor request for ${request.supervisor.name} has been rejected${reason ? `: ${reason}` : ''}`,
        "Rejection",
        "/student/status",
        "/student/status",
        "Medium"
    );

    res.status(200).json({
        success: true,
        message: "Supervisor request rejected successfully",
        data: request
    });
});


export const approveProject = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }

    if (project.status === "Approved") {
        return next(new ErrorHandler("Project is already approved", 400));
    }

    project.status = "Approved";
    await project.save();

    await notificationService.notifyUser(
        project.student,
        `Your project "${project.title}" has been approved by the admin.`,
        "Approval",
        `/projects/${project._id}`,
        "High"
    );

    res.status(200).json({
        success: true,
        message: "Project approved successfully",
        project
    });
});

export const rejectProject = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }

    if (project.status === "Rejected") {
        return next(new ErrorHandler("Project is already rejected", 400));
    }

    project.status = "Rejected";
    await project.save();

    await notificationService.notifyUser(
        project.student,
        `Your project "${project.title}" has been rejected by the admin.`,
        "Rejection",
        `/projects/${project._id}`,
        "High"
    );

    res.status(200).json({
        success: true,
        message: "Project rejected successfully",
        project
    });
});
