const CourseRegistry = artifacts.require("CourseRegistry");

module.exports = function (deployer) {
  deployer.deploy(CourseRegistry);
};