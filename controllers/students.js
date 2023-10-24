import mongoose from "mongoose";
import Student from "../models/students.js";

export const getStudents = async (req, res) => {
    try {
        const {
            start, limit, term, year
        } = req.query;

        const findParams = {};
        if (term) {
            findParams.term = term;
        }

        if (year) {
            findParams.year = year;
        }

        const Studentrec = await Student.find(findParams)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(start);
            // .populate("school");

        const totalCount = await Student.find(findParams).count();

        return res.status(200).json({
            data: Studentrec,
            totalCount
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

export const getStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const Studentrec = await Student.findById(id)
            .populate("placementLocationsHistory")
            .populate({
                path: "placementLocationsHistory",
                populate: [{ path: "hospital" }, { path: "instructor" }]
            })
            .populate("placementsHistory");
        // .populate("school");

        return res.status(200).json(Studentrec);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

export const getStudentPlacements = async (req, res) => {
    try {
        const { id } = req.params;

        const Studentrec = await Student.findById(id)
            .populate("placementLocationsHistory")
            .populate("placementsHistory");

        return res.status(200).json(Studentrec);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

export const addStudent = async (req, res) => {
    try {
        const params = req.body;
        const studentModel = await Student.findOne({ studentId: params.studentId });

        if (studentModel) {
            throw new Error("Student ID already exists");
        }

        const student = new Student(params);
        await student.save();
        // await Student.populate(student, { path: "school" });
        return res.status(201).json(student);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

export const importStudents = async (req, res) => {
    try {
        const failed = [];
        await Promise.all((req.body || []).map(async (student) => {
            try {
                const studentModel = await Student.findOne({ studentId: student.studentId });

                if (studentModel) {
                    throw new Error("Student ID already exists");
                } else {
                    await Student.create(student);
                }
            } catch (err) {
                failed.push({
                    data: student,
                    err: err.message
                });
                return null;
            }
        }));
        return res.json({ message: " Imported successfully.", failed });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

export const updateStudent = async (req, res) => {
    try {
        const { body, params } = req;

        if (!mongoose.Types.ObjectId.isValid(params.id)) return res.status(404).json({ message: `No entry found with id: ${params.id}` });

        const studentrec = await Student.findByIdAndUpdate(params.id, body, { new: true });
        if(!studentrec){
            throw new Error("Student not found");    
        }
        // await Student.populate(studentrec, { path: "school" });
        return res.status(200).json(studentrec);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await Student.findByIdAndDelete(id);
        return res.status(200).json({ message: "Successfully deleted" });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

export const deleteStudents = async (req, res) => {
    const { body } = req;
    try {
        await Student.deleteMany({ _id: { $in: body } });
        return res.json({ message: "Student record deleted successfully." });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
