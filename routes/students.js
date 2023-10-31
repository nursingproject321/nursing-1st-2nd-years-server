import express from "express";
import {
    addStudent, deleteStudent, deleteStudents, importStudents,
    getStudent,
    getStudents, updateStudent, getStudentPlacements, moveStudents
} from "../controllers/students.js";

const router = express.Router();

router.get("/", getStudents);

router.get("/:id", getStudent);

router.get("/:id/placements", getStudentPlacements);

router.post("/", addStudent);

router.post("/import", importStudents);

router.patch("/:id", updateStudent);

router.delete("/:id", deleteStudent); // For single deletion

router.post("/delete", deleteStudents); // For multiple deletion

router.post("/movestudents", moveStudents); // For moving students to next term

export default router;
