import Course from '../model/course.model.js';

// PUT/Edit a sections / Courses 
export const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const educatorId = req.user._id;
  const { editSection, addSection, deleteSectionId, ...courseUpdates } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.educatorId.toString() !== educatorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    // Update general course fields
    if (Object.keys(courseUpdates).length > 0) {
      Object.assign(course, courseUpdates);
    }

    // Edit a section by ID
    if (editSection && editSection._id) {
      const index = course.sections.findIndex(
        (s) => s._id.toString() === editSection._id
      );
      if (index !== -1) {
        course.sections[index] = {
          ...course.sections[index]._doc,
          ...editSection,
        };
      }
    }

    // Add a new section
    if (addSection) {
      course.sections.push(addSection);
    }

    // Delete a section by ID
    if (deleteSectionId) {
      course.sections = course.sections.filter(
        (s) => s._id.toString() !== deleteSectionId
      );
    }

    const updatedCourse = await course.save();
    res.json({ message: 'Course updated successfully', course: updatedCourse });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE a Course
export const deleteCourse = async (req, res) => {
  const { courseId } = req.params;
  const educatorId = req.user._id;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.educatorId.toString() !== educatorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await course.remove();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
