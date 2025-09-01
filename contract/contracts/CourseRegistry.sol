// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CourseRegistry {
    mapping(string => address[]) public coursePurchases;

    event CoursePurchased(string courseName, address indexed student);

    constructor() {
    }

    function purchaseCourse(string memory courseName) external {
        coursePurchases[courseName].push(msg.sender);
        emit CoursePurchased(courseName, msg.sender);
    }

    function getCourseStudents(string memory courseName) external view returns (address[] memory) {
        return coursePurchases[courseName];
    }

    function hasPurchased(string memory courseName, address student) external view returns (bool) {
        address[] memory students = coursePurchases[courseName];
        for (uint i = 0; i < students.length; i++) {
            if (students[i] == student) {
                return true;
            }
        }
        return false;
    }
}