const CourseRegistry = artifacts.require("CourseRegistry");
const OWCToken = artifacts.require("OWCToken");

contract("CourseRegistry", function (accounts) {
  let courseRegistry;
  let owcToken;
  const owner = accounts[0];
  const teacher = accounts[1];
  const student1 = accounts[2];
  const student2 = accounts[3];

  beforeEach(async function () {
    // Deploy OWC token first
    owcToken = await OWCToken.new({ from: owner });

    // Deploy CourseRegistry with OWC token address
    courseRegistry = await CourseRegistry.new(owcToken.address, { from: owner });

    // Transfer some tokens to students for testing
    await owcToken.transfer(student1, web3.utils.toBN("10000"), { from: owner });
    await owcToken.transfer(student2, web3.utils.toBN("10000"), { from: owner });

    // Approve CourseRegistry to spend tokens on behalf of students
    await owcToken.approve(courseRegistry.address, web3.utils.toBN("10000"), { from: student1 });
    await owcToken.approve(courseRegistry.address, web3.utils.toBN("10000"), { from: student2 });
  });

  describe("Deployment", function () {
    it("Should set the OWC token address correctly", async function () {
      const tokenAddress = await courseRegistry.owcToken();
      assert.equal(tokenAddress, owcToken.address, "OWC token address should be set correctly");
    });
  });

  describe("Course Creation", function () {
    it("Should allow creating a new course", async function () {
      const courseName = "Solidity Basics";
      const price = web3.utils.toBN("1000");

      const tx = await courseRegistry.createCourse(courseName, price, { from: teacher });

      // Check event emission
      assert.equal(tx.logs[0].event, "CourseCreated", "Should emit CourseCreated event");
      assert.equal(tx.logs[0].args.courseName, courseName, "Event should have correct course name");
      assert.equal(tx.logs[0].args.creator, teacher, "Event should have correct creator");
      assert.equal(tx.logs[0].args.price.toString(), price.toString(), "Event should have correct price");

      // Check course data
      const coursePrice = await courseRegistry.getCoursePrice(courseName);
      assert.equal(coursePrice.toString(), price.toString(), "Course price should be set correctly");

      // Check that teacher is automatically added as first student
      const students = await courseRegistry.getCourseStudents(courseName);
      assert.equal(students.length, 1, "Course should have one student (the creator)");
      assert.equal(students[0], teacher, "First student should be the course creator");
    });

    it("Should revert when creating course with zero price", async function () {
      const courseName = "Free Course";
      const price = web3.utils.toBN("0");

      try {
        await courseRegistry.createCourse(courseName, price, { from: teacher });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Price must be greater than 0"), "Should revert with correct message");
      }
    });

    it("Should revert when creating course that already exists", async function () {
      const courseName = "Duplicate Course";
      const price = web3.utils.toBN("1000");

      // Create course first time
      await courseRegistry.createCourse(courseName, price, { from: teacher });

      // Try to create same course again
      try {
        await courseRegistry.createCourse(courseName, price, { from: teacher });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Course already exists"), "Should revert with correct message");
      }
    });
  });

  describe("Course Purchase", function () {
    const courseName = "Web3 Development";
    const coursePrice = web3.utils.toBN("2000");

    beforeEach(async function () {
      // Create a course for testing
      await courseRegistry.createCourse(courseName, coursePrice, { from: teacher });
    });

    it("Should allow student to purchase a course", async function () {
      const initialBalance = await owcToken.balanceOf(student1);

      const tx = await courseRegistry.purchaseCourse(courseName, { from: student1 });

      // Check event emission
      assert.equal(tx.logs[0].event, "CoursePurchased", "Should emit CoursePurchased event");
      assert.equal(tx.logs[0].args.courseName, courseName, "Event should have correct course name");
      assert.equal(tx.logs[0].args.student, student1, "Event should have correct student");
      assert.equal(tx.logs[0].args.price.toString(), coursePrice.toString(), "Event should have correct price");

      // Check token transfer
      const finalBalance = await owcToken.balanceOf(student1);
      const balanceDecrease = initialBalance.sub(finalBalance);
      assert.equal(balanceDecrease.toString(), coursePrice.toString(), "Student should lose correct token amount");

      // Check contract received tokens
      const contractBalance = await owcToken.balanceOf(courseRegistry.address);
      assert.equal(contractBalance.toString(), coursePrice.toString(), "Contract should receive tokens");

      // Check student added to course
      const students = await courseRegistry.getCourseStudents(courseName);
      assert.equal(students.length, 2, "Course should have 2 students (creator + purchaser)");
      assert.equal(students[1], student1, "Second student should be the purchaser");

      // Check hasPurchased function
      const hasPurchased = await courseRegistry.hasPurchased(courseName, student1);
      assert.equal(hasPurchased, true, "Student should be marked as having purchased the course");
    });

    it("Should allow multiple students to purchase the same course", async function () {
      // Student1 purchases
      await courseRegistry.purchaseCourse(courseName, { from: student1 });

      // Student2 purchases
      await courseRegistry.purchaseCourse(courseName, { from: student2 });

      const students = await courseRegistry.getCourseStudents(courseName);
      assert.equal(students.length, 3, "Course should have 3 students (creator + 2 purchasers)");
      assert.equal(students[1], student1, "Second student should be student1");
      assert.equal(students[2], student2, "Third student should be student2");

      // Check both students are marked as having purchased
      const student1HasPurchased = await courseRegistry.hasPurchased(courseName, student1);
      const student2HasPurchased = await courseRegistry.hasPurchased(courseName, student2);
      assert.equal(student1HasPurchased, true, "Student1 should be marked as having purchased");
      assert.equal(student2HasPurchased, true, "Student2 should be marked as having purchased");
    });

    it("Should revert when student has insufficient OWC balance", async function () {
      // Transfer away most of student1's tokens
      const balance = await owcToken.balanceOf(student1);
      const keepAmount = coursePrice.sub(web3.utils.toBN("100")); // Keep less than course price
      const transferAmount = balance.sub(keepAmount);
      await owcToken.transfer(owner, transferAmount, { from: student1 });

      try {
        await courseRegistry.purchaseCourse(courseName, { from: student1 });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Insufficient OWC balance"), "Should revert with correct message");
      }
    });

    it("Should revert when student hasn't approved enough tokens", async function () {
      // Reset approval to less than course price
      await owcToken.approve(courseRegistry.address, coursePrice.sub(web3.utils.toBN("100")), { from: student1 });

      try {
        await courseRegistry.purchaseCourse(courseName, { from: student1 });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("ERC20: insufficient allowance") || error.message.includes("revert"), "Should revert with insufficient allowance");
      }
    });

    it("Should handle purchasing non-existent course", async function () {
      const nonExistentCourse = "Non-existent Course";

      try {
        await courseRegistry.purchaseCourse(nonExistentCourse, { from: student1 });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Course does not exist"), "Should revert when course doesn't exist");
      }
    });
  });

  describe("Course Data Retrieval", function () {
    const courseName = "Data Structures";
    const coursePrice = web3.utils.toBN("1500");

    beforeEach(async function () {
      await courseRegistry.createCourse(courseName, coursePrice, { from: teacher });
      await courseRegistry.purchaseCourse(courseName, { from: student1 });
      await courseRegistry.purchaseCourse(courseName, { from: student2 });
    });

    it("Should return correct course students", async function () {
      const students = await courseRegistry.getCourseStudents(courseName);

      assert.equal(students.length, 3, "Should return correct number of students");
      assert.equal(students[0], teacher, "First student should be course creator");
      assert.equal(students[1], student1, "Second student should be student1");
      assert.equal(students[2], student2, "Third student should be student2");
    });

    it("Should return correct purchase status for students", async function () {
      const teacherHasPurchased = await courseRegistry.hasPurchased(courseName, teacher);
      const student1HasPurchased = await courseRegistry.hasPurchased(courseName, student1);
      const student2HasPurchased = await courseRegistry.hasPurchased(courseName, student2);
      const ownerHasPurchased = await courseRegistry.hasPurchased(courseName, owner);

      assert.equal(teacherHasPurchased, true, "Teacher should be marked as having access");
      assert.equal(student1HasPurchased, true, "Student1 should be marked as having purchased");
      assert.equal(student2HasPurchased, true, "Student2 should be marked as having purchased");
      assert.equal(ownerHasPurchased, false, "Owner should not be marked as having purchased");
    });

    it("Should return empty array for non-existent course", async function () {
      const students = await courseRegistry.getCourseStudents("Non-existent Course");
      assert.equal(students.length, 0, "Should return empty array for non-existent course");
    });

    it("Should return false for non-purchaser on existing course", async function () {
      const hasPurchased = await courseRegistry.hasPurchased(courseName, owner);
      assert.equal(hasPurchased, false, "Non-purchaser should return false");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle course with very long name", async function () {
      const longCourseName = "A".repeat(100); // 100 character course name
      const price = web3.utils.toBN("1000");

      const tx = await courseRegistry.createCourse(longCourseName, price, { from: teacher });
      assert.equal(tx.logs[0].args.courseName, longCourseName, "Should handle long course names");
    });

    it("Should handle course with maximum price", async function () {
      const courseName = "Expensive Course";
      const maxPrice = web3.utils.toBN("2").pow(web3.utils.toBN("256")).sub(web3.utils.toBN("1")); // Max uint256

      // This should succeed as Solidity can handle max uint256
      await courseRegistry.createCourse(courseName, maxPrice, { from: teacher });
      const coursePrice = await courseRegistry.getCoursePrice(courseName);
      assert.equal(coursePrice.toString(), maxPrice.toString(), "Should handle maximum price");
    });

    it("Should allow same student to be added multiple times (current implementation)", async function () {
      const courseName = "Duplicate Student Course";
      const price = web3.utils.toBN("1000");

      await courseRegistry.createCourse(courseName, price, { from: teacher });

      // Purchase twice with same student
      await courseRegistry.purchaseCourse(courseName, { from: student1 });
      await courseRegistry.purchaseCourse(courseName, { from: student1 });

      const students = await courseRegistry.getCourseStudents(courseName);
      assert.equal(students.length, 3, "Student can be added multiple times");
      assert.equal(students[1], student1, "Second entry should be student1");
      assert.equal(students[2], student1, "Third entry should be student1");
    });
  });
});