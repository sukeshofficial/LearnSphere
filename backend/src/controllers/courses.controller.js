import * as coursesService from "../services/courses.service.js";

export async function createCourse(req, res) {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const course = await coursesService.createCourse(
      req.user.id,
      title.trim()
    );

    res.status(201).json(course);

  } catch (err) {
    console.error("createCourse error:", err);
    res.status(500).json({ error: "Failed to create course" });
  }
}
