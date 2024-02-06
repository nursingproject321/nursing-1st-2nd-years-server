import mongoose from "mongoose";
import Student from "../models/students.js";

export const getStudents = async (req, res) => {
  try {
    const { start, limit, term, year, study_year } = req.query;

    const findParams = {};
    if (term) {
      findParams.term = term;
    }
    if (year) {
      findParams.year = year;
    }
    if (study_year) {
      findParams.study_year = study_year;
    }

    const Studentrec = await Student.find(findParams)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(start)
      .populate("placementLocationsHistory", "placementsHistory");
    // .populate("school");

    const totalCount = await Student.find(findParams).count();

    return res.status(200).json({
      data: Studentrec,
      totalCount,
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
        populate: [{ path: "hospital" }, { path: "instructor" }],
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
    params.joined_term = params.term;
    params.joined_year = params.year;
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
    await Promise.all(
      (req.body || []).map(async (student) => {
        try {
          student.year = new Date().getFullYear();
          const studentModel = await Student.findOne({
            studentId: student.studentId,
          });
          if (studentModel) {
            throw new Error("Student ID already exists");
          } else {
            student.joined_term = student.term;
            student.joined_year = student.year;
            console.log("====================================");
            console.log(student);
            console.log("====================================");
            await Student.create(student);
          }
        } catch (err) {
          failed.push({
            data: student,
            err: err.message,
          });
          return null;
        }
      })
    );
    return res.json({ message: " Imported successfully.", failed });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { body, params } = req;
    // This can be used to update the joined term and year
    // if(params.term){
    //     params.joined_term = params.term;
    // }
    // if(params.year){
    //     params.joined_year = params.joined_year
    // }

    if (!mongoose.Types.ObjectId.isValid(params.id))
      return res
        .status(404)
        .json({ message: `No entry found with id: ${params.id}` });

    const studentrec = await Student.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    if (!studentrec) {
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

// Move students to next term
export const moveStudents = async (req, res) => {
  try {
    // const {year, term, study_year} = req.body;
    const terms_list = { 0: "Winter", 1: "Inter Summer", 2: "Fall" };
    // moving to next term
    let new_term, new_study_year, current_term, current_study_year;
    let new_year = new Date().getFullYear();
    // get students
    const students_lst = await Student.find({ study_year: { $lt: 4 } });
    if (!students_lst || students_lst.length == 0) {
      throw new Error("No students found");
    }
    students_lst.forEach(async (student_doc) => {
      // set new term
      current_term = student_doc.term;
      current_study_year = student_doc.study_year;
      if (current_term == "Winter") {
        new_term = terms_list[1];
      } else if (current_term == "Inter Summer") {
        new_term = terms_list[2];
      } else {
        new_term = terms_list[0];
      }
      // set new study_year like 2nd or 3rd year
      new_study_year = current_study_year;
      if (student_doc.joined_term == new_term) {
        new_study_year++;
      }
      student_doc.study_year = new_study_year;
      student_doc.term = new_term;
      student_doc.year = new_year;

      // For Testing
      // student_doc.study_year=1;
      // student_doc.year=2023;
      // student_doc.term="Fall";
      // student_doc.joined_year=2023;
      // student_doc.joined_term="Fall";
      // student_doc.placementLocationsHistory=[];
      // student_doc.placementsHistory=[];

      await student_doc.save();
    });
    return res.status(200).json({
      message: `Students moved to the next term`,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
