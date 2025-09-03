// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CourseRegistry is Ownable {
    struct Course {
        uint256 price;
        address creator;
        address[] students;
    }

    IERC20 public owcToken;
    mapping(string => Course) public courses;

    // 奖励池相关
    uint256 public rewardPool;  // 合约内的奖励池余额
    uint256 public constant COMPLETION_REWARD = 50;  // 完成课程奖励 50 OWC
    mapping(string => mapping(address => bool)) public courseCompleted; // 课程完成状态
    mapping(address => uint256) public totalRewardsEarned; // 学生总奖励记录

    event CoursePurchased(string courseName, address indexed student, uint256 price);
    event CourseCreated(string courseName, address indexed creator, uint256 price);
    event CourseCompleted(string courseName, address indexed student, uint256 reward);
    event RewardPoolFunded(address indexed funder, uint256 amount);
    event RewardPoolWithdrawn(address indexed admin, uint256 amount);

    constructor(address _owcTokenAddress) Ownable(msg.sender) {
        owcToken = IERC20(_owcTokenAddress);
        rewardPool = 0; // 初始化奖励池为0
    }

    function createCourse(string memory courseName, uint256 price) external {
        require(price > 0, "Price must be greater than 0");
        require(courses[courseName].price == 0, "Course already exists");

        courses[courseName].price = price;
        courses[courseName].creator = msg.sender;
        courses[courseName].students.push(msg.sender);

        emit CourseCreated(courseName, msg.sender, price);
    }

    function purchaseCourse(string memory courseName) external {
        Course storage course = courses[courseName];
        require(course.price > 0, "Course does not exist");
        require(owcToken.balanceOf(msg.sender) >= course.price, "Insufficient OWC balance");
        require(owcToken.allowance(msg.sender, address(this)) >= course.price, "Insufficient allowance");

        bool success = owcToken.transferFrom(msg.sender, course.creator, course.price);
        require(success, "Token transfer failed");

        course.students.push(msg.sender);
        emit CoursePurchased(courseName, msg.sender, course.price);
    }

    function getCourseStudents(string memory courseName) external view returns (address[] memory) {
        return courses[courseName].students;
    }

    function hasPurchased(string memory courseName, address student) external view returns (bool) {
        address[] memory students = courses[courseName].students;
        for (uint i = 0; i < students.length; i++) {
            if (students[i] == student) {
                return true;
            }
        }
        return false;
    }

    function getCoursePrice(string memory courseName) external view returns (uint256) {
        return courses[courseName].price;
    }

    function getCourseCreator(string memory courseName) external view returns (address) {
        return courses[courseName].creator;
    }

    // 奖励池管理功能
    function fundRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(owcToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(owcToken.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        bool success = owcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        rewardPool += amount;
        emit RewardPoolFunded(msg.sender, amount);
    }

    function withdrawFromRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(rewardPool >= amount, "Insufficient reward pool balance");

        bool success = owcToken.transfer(msg.sender, amount);
        require(success, "Transfer failed");

        rewardPool -= amount;
        emit RewardPoolWithdrawn(msg.sender, amount);
    }

    // 学生完成课程功能
    function completeCourse(string memory courseName) external {
        Course storage course = courses[courseName];
        require(course.price > 0, "Course does not exist");
        require(_hasPurchased(courseName, msg.sender), "You must purchase the course first");
        require(!courseCompleted[courseName][msg.sender], "Course already completed");
        require(rewardPool >= COMPLETION_REWARD, "Insufficient reward pool");

        // 标记课程为已完成
        courseCompleted[courseName][msg.sender] = true;

        // 更新学生总奖励记录
        totalRewardsEarned[msg.sender] += COMPLETION_REWARD;

        // 从奖励池转移代币给学生
        rewardPool -= COMPLETION_REWARD;
        bool success = owcToken.transfer(msg.sender, COMPLETION_REWARD);
        require(success, "Reward transfer failed");

        emit CourseCompleted(courseName, msg.sender, COMPLETION_REWARD);
    }

    // 内部函数
    function _hasPurchased(string memory courseName, address student) internal view returns (bool) {
        address[] memory students = courses[courseName].students;
        for (uint i = 0; i < students.length; i++) {
            if (students[i] == student) {
                return true;
            }
        }
        return false;
    }

    // 查询功能
    function hasCourseCompleted(string memory courseName, address student) external view returns (bool) {
        return courseCompleted[courseName][student];
    }

    function getStudentTotalRewards(address student) external view returns (uint256) {
        return totalRewardsEarned[student];
    }

    function getRewardPool() external view returns (uint256) {
        return rewardPool;
    }

    function getCompletedStudents(string memory courseName) external view returns (address[] memory) {
        Course storage course = courses[courseName];
        address[] memory students = course.students;

        // 计算已完成的学生数量
        uint256 completedCount = 0;
        for (uint i = 0; i < students.length; i++) {
            if (courseCompleted[courseName][students[i]]) {
                completedCount++;
            }
        }

        // 创建已完成学生数组
        address[] memory completedStudents = new address[](completedCount);
        uint256 index = 0;
        for (uint i = 0; i < students.length; i++) {
            if (courseCompleted[courseName][students[i]]) {
                completedStudents[index] = students[i];
                index++;
            }
        }

        return completedStudents;
    }
}