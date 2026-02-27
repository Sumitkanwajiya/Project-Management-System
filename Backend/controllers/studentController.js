import asyncHandler from "../middleware/asyncHandler.js";
import { ErrorHandler } from "../middleware/error.js";
import User from "../models/user.js";
import * as projectService from "../services/projectService.js";
import * as notificationService from "../services/notificationService.js";
import * as requestService from "../services/requestService.js";
import * as fileService from "../services/fileServices.js";
import project from "../models/project.js";

export const getStudentProject = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const project = await projectService.getProjectByStudentId(studentId);

    if (!project) {
        return res.status(200).json({
            success: true,
            data: { project: null },
            message: "Project not found",
        });
    }

    res.status(200).json({
        success: true,
        data: { project },
    });
});

export const submitProposal = asyncHandler(async (req, res, next) => {
    const { title } = req.body;
    const description = req.body.description || req.body.discription;
    const studentId = req.user._id;

    const existingProject = await projectService.getProjectByStudentId(studentId);

    if (existingProject && existingProject.status !== "Rejected") {
        return next(
            new ErrorHandler(
                "You have already submitted a proposal. You can only submit a new one if the previous was rejected.",
                400
            )
        );
    }

    const project = await projectService.createProject({
        title,
        description,
        student: studentId,
    });

    const user = await User.findById(studentId);
    if (!user.project || !Array.isArray(user.project)) {
        user.project = [];
    }
    user.project.push(project._id);
    await user.save();

    res.status(201).json({
        success: true,
        data: { project },
        message: "Project proposal submitted successfully",
    });
});

export const uploadFile = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const { projectId } = req.params;
    // req.files is an object with keys as fieldnames, we need to flatten it
    const files = req.files ? Object.values(req.files).flat() : [];

    if (!files || files.length === 0) {
        return next(new ErrorHandler("Please upload a file", 400));
    }

    const project = await projectService.getProjectById(projectId);

    if (project.student._id.toString() !== studentId.toString()) {
        return next(
            new ErrorHandler("You are not authorized to access this resource", 403)
        );
    }

    const updatedProject = await projectService.uploadFile(projectId, files);

    res.status(200).json({
        success: true,
        data: { project: updatedProject },
        message: "File uploaded successfully",
    });
});

export const getAvailableSupervisors = asyncHandler(async (req, res) => {
    const supervisors = await User.find({ role: { $regex: /^teacher$/i } })
        .select("name email department");

    res.status(200).json({
        success: true,
        data: { supervisors },
        message: "Available supervisors fetched successfully",
    });
});

export const getSupervisor = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const student = await User.findById(studentId).populate("supervisor", "name email department experties");

    if (!student.supervisor) {
        return res.status(404).json({
            success: false,
            data: { supervisor: null },
            message: "No supervisor assigned yet",
        });
    }
    res.status(200).json({
        success: true,
        data: { supervisor: student.supervisor },
        message: "Supervisor fetched successfully",
    });
});

export const requestSupervisorChange = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const { teacherId, message } = req.body;
    const student = await User.findById(studentId);
    if (student.supervisor) {
        return next(new ErrorHandler("You already have a supervisor", 400));
    }

    const supervisor = await User.findById(teacherId);
    if (!supervisor || supervisor.role.toLowerCase() !== "teacher") {
        return next(new ErrorHandler("Teacher not found", 404));
    }

    if (supervisor.maxStudents === supervisor.assignedStudents.length) {
        return next(new ErrorHandler("Selected supervisor is not available, Reached max students", 400));
    }

    const requestData = {
        student: studentId,
        supervisor: teacherId,
        message: message,

    };

    const request = await requestService.createRequest(requestData);

    await notificationService.notifyUser(
        teacherId,
        ` ${student.name} has requested  ${supervisor.name} to be their supervisor.`,
        "Request",
        "teacher/requests",
        "Medium"
    );

    res.status(200).json({
        success: true,
        data: { request },
        message: "Supervisor request sent successfully",
    });
});


import Notification from "../models/notification.js";

export const dashboardStats = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const studentProject = await project.findOne({ student: studentId })
        .sort({ createdAt: -1 }).populate("supervisor", "name").lean();

    const now = new Date();
    const upcomingDeadline = await project.find({
        student: studentId,
        deadline: { $gte: now },
    }).select("title description deadline")
        .sort({ deadline: 1 })
        .limit(3)
        .lean();


    const topNotifications = await Notification.find({
        user: studentId,

    })
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    const latestFeedback = studentProject?.feedback && studentProject?.feedback.length > 0
        ? studentProject.feedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

    const feedbackNotification = latestFeedback
        ? (latestFeedback.message ? latestFeedback.message.slice(0, 100) + "..." : "Check feedback details")
        : "No feedback yet";

    const supervisorName = studentProject?.supervisor?.name || null

    res.status(200).json({
        success: true,
        data: {
            project: studentProject,
            upcomingDeadline,
            topNotifications,
            feedbackNotification,
            supervisorName,
        },
        message: "Dashboard stats fetched successfully",
    });
});

export const getFeedback = asyncHandler(async (req, res, next) => {

    const { projectId } = req.params;
    const studentId = req.user._id;

    const project = await projectService.getProjectById(projectId);
    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }
    if (project.student._id.toString() !== studentId.toString()) {
        return next(new ErrorHandler("You are not authorized to view this project", 403));
    }

    // Populate supervisor details in feedback
    await project.populate({
        path: 'feedback.supervisorId',
        select: 'name email'
    });

    const sortFeedback = project.feedback.sort((a, b) => b.createdAt - a.createdAt);
    res.status(200).json({
        success: true,
        data: { feedback: sortFeedback },
        message: "Feedback fetched successfully",
    });

})

export const downloadFile = asyncHandler(async (req, res, next) => {
    const { projectId, fileId } = req.params;
    const studentId = req.user._id;

    const project = await projectService.getProjectById(projectId);
    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }
    if (project.student._id.toString() !== studentId.toString()) {
        return next(new ErrorHandler("You are not authorized to download this file", 403));
    }

    const file = project.files.id(fileId);
    if (!file) {
        return next(new ErrorHandler("File not found", 404));
    }

    fileService.streamDownload(file.fileUrl, file.originalName, res);
})

export const viewFile = asyncHandler(async (req, res, next) => {
    const { projectId, fileId } = req.params;
    const studentId = req.user._id;

    const project = await projectService.getProjectById(projectId);
    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }
    if (project.student._id.toString() !== studentId.toString()) {
        return next(new ErrorHandler("You are not authorized to view this file", 403));
    }

    const file = project.files.id(fileId);
    if (!file) {
        return next(new ErrorHandler("File not found", 404));
    }

    res.sendFile(file.fileUrl);
})