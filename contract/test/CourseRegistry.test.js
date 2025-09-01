const CourseRegistry = artifacts.require("CourseRegistry");
const { expectEvent } = require('@openzeppelin/test-helpers');

contract("CourseRegistry", function (accounts) {
  let courseRegistry;
  const [deployer, student1, student2] = accounts;
  
  beforeEach(async function () {
    courseRegistry = await CourseRegistry.new({ from: deployer });
  });

  describe("Course Purchase", function () {
    it("should allow student to purchase course", async function () {
      const courseName = "Blockchain Development";

      const receipt = await courseRegistry.purchaseCourse(courseName, { from: student1 });

      expectEvent(receipt, 'CoursePurchased', {
        courseName: courseName,
        student: student1
      });

      const hasPurchased = await courseRegistry.hasPurchased(courseName, student1);
      assert.equal(hasPurchased, true);
    });

    it("should allow multiple students to purchase same course", async function () {
      const courseName = "Web3 Development";

      await courseRegistry.purchaseCourse(courseName, { from: student1 });
      await courseRegistry.purchaseCourse(courseName, { from: student2 });

      const students = await courseRegistry.getCourseStudents(courseName);
      assert.equal(students.length, 2);
      assert.equal(students[0], student1);
      assert.equal(students[1], student2);
    });

    it("should allow same student to purchase different courses", async function () {
      const course1 = "Course A";
      const course2 = "Course B";

      await courseRegistry.purchaseCourse(course1, { from: student1 });
      await courseRegistry.purchaseCourse(course2, { from: student1 });

      const hasPurchasedA = await courseRegistry.hasPurchased(course1, student1);
      const hasPurchasedB = await courseRegistry.hasPurchased(course2, student1);
      
      assert.equal(hasPurchasedA, true);
      assert.equal(hasPurchasedB, true);
    });

    it("should return empty array for course with no students", async function () {
      const students = await courseRegistry.getCourseStudents("NonExistent Course");
      assert.equal(students.length, 0);
    });

    it("should return false for student who hasn't purchased course", async function () {
      const hasPurchased = await courseRegistry.hasPurchased("Some Course", student1);
      assert.equal(hasPurchased, false);
    });
  });
});