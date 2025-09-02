const CourseRegistry = artifacts.require("CourseRegistry");
const OWCToken = artifacts.require("OWCToken");

contract("CourseRegistry - Reward Pool System", function (accounts) {
  let courseRegistry;
  let owcToken;
  const owner = accounts[0];          // 合约 owner (管理员)
  const teacher = accounts[1];        // 课程创建者
  const student1 = accounts[2];       // 学生1
  const student2 = accounts[3];       // 学生2
  const student3 = accounts[4];       // 学生3

  const COMPLETION_REWARD = 50; // 完成奖励 50 OWC

  beforeEach(async function () {
    // Deploy OWC token first
    owcToken = await OWCToken.new({ from: owner });
    
    // Deploy CourseRegistry with OWC token address
    courseRegistry = await CourseRegistry.new(owcToken.address, { from: owner });
    
    // Transfer some tokens to different accounts
    await owcToken.transfer(teacher, web3.utils.toBN("5000"), { from: owner });
    await owcToken.transfer(student1, web3.utils.toBN("10000"), { from: owner });
    await owcToken.transfer(student2, web3.utils.toBN("10000"), { from: owner });
    await owcToken.transfer(student3, web3.utils.toBN("10000"), { from: owner });
    
    // Approve CourseRegistry to spend tokens on behalf of students
    await owcToken.approve(courseRegistry.address, web3.utils.toBN("10000"), { from: student1 });
    await owcToken.approve(courseRegistry.address, web3.utils.toBN("10000"), { from: student2 });
    await owcToken.approve(courseRegistry.address, web3.utils.toBN("10000"), { from: student3 });
    
    // Approve CourseRegistry to spend owner's tokens for funding reward pool
    await owcToken.approve(courseRegistry.address, web3.utils.toBN("100000"), { from: owner });
  });

  describe("Reward Pool Management", function () {
    it("Should initialize with empty reward pool", async function () {
      const rewardPool = await courseRegistry.getRewardPool();
      assert.equal(rewardPool.toString(), "0", "Initial reward pool should be 0");
    });

    it("Should have correct completion reward constant", async function () {
      const reward = await courseRegistry.COMPLETION_REWARD();
      assert.equal(reward.toString(), COMPLETION_REWARD.toString(), "Completion reward should be 50");
    });

    it("Should allow owner to fund reward pool", async function () {
      const fundAmount = web3.utils.toBN("1000");
      const initialPool = await courseRegistry.getRewardPool();
      const initialOwnerBalance = await owcToken.balanceOf(owner);

      const tx = await courseRegistry.fundRewardPool(fundAmount, { from: owner });

      // Check event emission
      assert.equal(tx.logs[0].event, "RewardPoolFunded", "Should emit RewardPoolFunded event");
      assert.equal(tx.logs[0].args.funder, owner, "Event should have correct funder");
      assert.equal(tx.logs[0].args.amount.toString(), fundAmount.toString(), "Event should have correct amount");

      // Check reward pool balance
      const finalPool = await courseRegistry.getRewardPool();
      const poolIncrease = finalPool.sub(initialPool);
      assert.equal(poolIncrease.toString(), fundAmount.toString(), "Reward pool should increase correctly");

      // Check owner balance decrease
      const finalOwnerBalance = await owcToken.balanceOf(owner);
      const ownerDecrease = initialOwnerBalance.sub(finalOwnerBalance);
      assert.equal(ownerDecrease.toString(), fundAmount.toString(), "Owner balance should decrease");
    });

    it("Should revert when non-owner tries to fund reward pool", async function () {
      const fundAmount = web3.utils.toBN("1000");
      
      try {
        await courseRegistry.fundRewardPool(fundAmount, { from: teacher });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("revert"), "Should revert when non-owner tries to fund");
      }
    });

    it("Should revert when funding with zero amount", async function () {
      try {
        await courseRegistry.fundRewardPool(0, { from: owner });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Amount must be greater than 0"), "Should revert with correct message");
      }
    });

    it("Should allow owner to withdraw from reward pool", async function () {
      // First fund the pool
      const fundAmount = web3.utils.toBN("1000");
      await courseRegistry.fundRewardPool(fundAmount, { from: owner });

      // Then withdraw
      const withdrawAmount = web3.utils.toBN("500");
      const initialPool = await courseRegistry.getRewardPool();
      const initialOwnerBalance = await owcToken.balanceOf(owner);

      const tx = await courseRegistry.withdrawFromRewardPool(withdrawAmount, { from: owner });

      // Check event emission
      assert.equal(tx.logs[0].event, "RewardPoolWithdrawn", "Should emit RewardPoolWithdrawn event");
      assert.equal(tx.logs[0].args.admin, owner, "Event should have correct admin");
      assert.equal(tx.logs[0].args.amount.toString(), withdrawAmount.toString(), "Event should have correct amount");

      // Check reward pool balance
      const finalPool = await courseRegistry.getRewardPool();
      const poolDecrease = initialPool.sub(finalPool);
      assert.equal(poolDecrease.toString(), withdrawAmount.toString(), "Reward pool should decrease correctly");

      // Check owner balance increase
      const finalOwnerBalance = await owcToken.balanceOf(owner);
      const ownerIncrease = finalOwnerBalance.sub(initialOwnerBalance);
      assert.equal(ownerIncrease.toString(), withdrawAmount.toString(), "Owner balance should increase");
    });

    it("Should revert when withdrawing more than available", async function () {
      const fundAmount = web3.utils.toBN("500");
      await courseRegistry.fundRewardPool(fundAmount, { from: owner });

      const withdrawAmount = web3.utils.toBN("1000"); // More than funded

      try {
        await courseRegistry.withdrawFromRewardPool(withdrawAmount, { from: owner });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Insufficient reward pool balance"), "Should revert with correct message");
      }
    });
  });

  describe("Course Completion with Reward Pool", function () {
    const courseName = "Blockchain Fundamentals";
    const coursePrice = web3.utils.toBN("1000");

    beforeEach(async function () {
      // Create course and student purchases it
      await courseRegistry.createCourse(courseName, coursePrice, { from: teacher });
      await courseRegistry.purchaseCourse(courseName, { from: student1 });
      
      // Fund reward pool
      const fundAmount = web3.utils.toBN("1000");
      await courseRegistry.fundRewardPool(fundAmount, { from: owner });
    });

    it("Should allow student to complete course and receive reward from pool", async function () {
      const initialStudentBalance = await owcToken.balanceOf(student1);
      const initialPool = await courseRegistry.getRewardPool();
      const initialTotalRewards = await courseRegistry.getStudentTotalRewards(student1);

      const tx = await courseRegistry.completeCourse(courseName, { from: student1 });

      // Check event emission
      assert.equal(tx.logs[0].event, "CourseCompleted", "Should emit CourseCompleted event");
      assert.equal(tx.logs[0].args.courseName, courseName, "Event should have correct course name");
      assert.equal(tx.logs[0].args.student, student1, "Event should have correct student");
      assert.equal(tx.logs[0].args.reward.toString(), COMPLETION_REWARD.toString(), "Event should have correct reward");

      // Check student balance increase
      const finalStudentBalance = await owcToken.balanceOf(student1);
      const studentIncrease = finalStudentBalance.sub(initialStudentBalance);
      assert.equal(studentIncrease.toString(), COMPLETION_REWARD.toString(), "Student should receive reward");

      // Check reward pool decrease
      const finalPool = await courseRegistry.getRewardPool();
      const poolDecrease = initialPool.sub(finalPool);
      assert.equal(poolDecrease.toString(), COMPLETION_REWARD.toString(), "Reward pool should decrease");

      // Check completion status
      const isCompleted = await courseRegistry.hasCourseCompleted(courseName, student1);
      assert.equal(isCompleted, true, "Course should be marked as completed");

      // Check total rewards tracking
      const finalTotalRewards = await courseRegistry.getStudentTotalRewards(student1);
      const rewardIncrease = finalTotalRewards.sub(initialTotalRewards);
      assert.equal(rewardIncrease.toString(), COMPLETION_REWARD.toString(), "Total rewards should be updated");
    });

    it("Should revert when reward pool is insufficient", async function () {
      // Withdraw most of the reward pool, leaving less than reward amount
      const withdrawAmount = web3.utils.toBN("980"); // Leave only 20 OWC
      await courseRegistry.withdrawFromRewardPool(withdrawAmount, { from: owner });

      try {
        await courseRegistry.completeCourse(courseName, { from: student1 });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Insufficient reward pool"), "Should revert with insufficient pool");
      }
    });

    it("Should revert when non-student tries to complete course", async function () {
      try {
        await courseRegistry.completeCourse(courseName, { from: student2 });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("You must purchase the course first"), "Should revert with correct message");
      }
    });

    it("Should revert when trying to complete course twice", async function () {
      // Complete course first time
      await courseRegistry.completeCourse(courseName, { from: student1 });
      
      try {
        await courseRegistry.completeCourse(courseName, { from: student1 });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Course already completed"), "Should revert with correct message");
      }
    });
  });

  describe("Multiple Students and Courses", function () {
    const course1Name = "DeFi Basics";
    const course2Name = "NFT Development";
    const coursePrice = web3.utils.toBN("1500");

    beforeEach(async function () {
      // Create multiple courses
      await courseRegistry.createCourse(course1Name, coursePrice, { from: teacher });
      await courseRegistry.createCourse(course2Name, coursePrice, { from: teacher });
      
      // Students purchase courses
      await courseRegistry.purchaseCourse(course1Name, { from: student1 });
      await courseRegistry.purchaseCourse(course2Name, { from: student1 });
      await courseRegistry.purchaseCourse(course1Name, { from: student2 });
      
      // Fund reward pool with enough for multiple rewards
      const fundAmount = web3.utils.toBN("5000");
      await courseRegistry.fundRewardPool(fundAmount, { from: owner });
    });

    it("Should handle multiple course completions correctly", async function () {
      const initialPool = await courseRegistry.getRewardPool();

      // Student1 completes both courses
      await courseRegistry.completeCourse(course1Name, { from: student1 });
      await courseRegistry.completeCourse(course2Name, { from: student1 });

      // Student2 completes one course
      await courseRegistry.completeCourse(course1Name, { from: student2 });

      // Check reward pool decreased by 3 rewards (3 * 50 = 150)
      const finalPool = await courseRegistry.getRewardPool();
      const totalDecrease = initialPool.sub(finalPool);
      const expectedDecrease = web3.utils.toBN(COMPLETION_REWARD.toString()).mul(web3.utils.toBN("3"));
      assert.equal(totalDecrease.toString(), expectedDecrease.toString(), "Pool should decrease by total rewards given");

      // Check individual total rewards
      const student1TotalRewards = await courseRegistry.getStudentTotalRewards(student1);
      const student2TotalRewards = await courseRegistry.getStudentTotalRewards(student2);
      
      assert.equal(student1TotalRewards.toString(), web3.utils.toBN(COMPLETION_REWARD.toString()).mul(web3.utils.toBN("2")).toString(), "Student1 should have rewards from 2 courses");
      assert.equal(student2TotalRewards.toString(), COMPLETION_REWARD.toString(), "Student2 should have reward from 1 course");
    });

    it("Should return correct completed students", async function () {
      // Complete courses
      await courseRegistry.completeCourse(course1Name, { from: student1 });
      await courseRegistry.completeCourse(course1Name, { from: student2 });

      const completedStudents = await courseRegistry.getCompletedStudents(course1Name);
      
      // Should include student1 and student2 (teacher hasn't called completeCourse)
      assert.equal(completedStudents.length, 2, "Should return 2 completed students");
      
      const student1Included = completedStudents.includes(student1);
      const student2Included = completedStudents.includes(student2);
      
      assert.equal(student1Included, true, "Student1 should be in completed list");
      assert.equal(student2Included, true, "Student2 should be in completed list");
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should handle reward pool running out gracefully", async function () {
      const courseName = "Test Course";
      const coursePrice = web3.utils.toBN("1000");

      await courseRegistry.createCourse(courseName, coursePrice, { from: teacher });
      await courseRegistry.purchaseCourse(courseName, { from: student1 });
      await courseRegistry.purchaseCourse(courseName, { from: student2 });

      // Fund pool with exactly one reward
      await courseRegistry.fundRewardPool(web3.utils.toBN(COMPLETION_REWARD.toString()), { from: owner });

      // First student can complete
      await courseRegistry.completeCourse(courseName, { from: student1 });

      // Second student cannot complete due to insufficient pool
      try {
        await courseRegistry.completeCourse(courseName, { from: student2 });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Insufficient reward pool"), "Should revert with insufficient pool");
      }
    });

    it("Should prevent unauthorized access to admin functions", async function () {
      const amount = web3.utils.toBN("1000");

      // Non-owner cannot fund
      try {
        await courseRegistry.fundRewardPool(amount, { from: student1 });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("revert"), "Should revert when non-owner tries to fund");
      }

      // Non-owner cannot withdraw
      try {
        await courseRegistry.withdrawFromRewardPool(amount, { from: student1 });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("revert"), "Should revert when non-owner tries to withdraw");
      }
    });

    it("Should maintain accurate reward pool accounting", async function () {
      // Multiple funding and withdrawal operations
      await courseRegistry.fundRewardPool(web3.utils.toBN("1000"), { from: owner });
      await courseRegistry.fundRewardPool(web3.utils.toBN("500"), { from: owner });
      await courseRegistry.withdrawFromRewardPool(web3.utils.toBN("300"), { from: owner });

      let expectedPool = web3.utils.toBN("1200"); // 1000 + 500 - 300
      let actualPool = await courseRegistry.getRewardPool();
      assert.equal(actualPool.toString(), expectedPool.toString(), "Pool accounting should be accurate");

      // Add a course completion
      const courseName = "Accounting Test";
      const coursePrice = web3.utils.toBN("1000");
      await courseRegistry.createCourse(courseName, coursePrice, { from: teacher });
      await courseRegistry.purchaseCourse(courseName, { from: student1 });
      await courseRegistry.completeCourse(courseName, { from: student1 });

      expectedPool = expectedPool.sub(web3.utils.toBN(COMPLETION_REWARD.toString()));
      actualPool = await courseRegistry.getRewardPool();
      assert.equal(actualPool.toString(), expectedPool.toString(), "Pool should decrease by reward amount");
    });
  });
});