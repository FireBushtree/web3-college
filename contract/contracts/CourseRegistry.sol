// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CourseRegistry {
    struct Course {
        uint256 price;
        address creator;
        address[] students;
    }

    IERC20 public owcToken;
    mapping(string => Course) public courses;

    event CoursePurchased(string courseName, address indexed student, uint256 price);
    event CourseCreated(string courseName, address indexed creator, uint256 price);

    constructor(address _owcTokenAddress) {
        owcToken = IERC20(_owcTokenAddress);
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
}