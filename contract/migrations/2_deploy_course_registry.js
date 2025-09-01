const OWCToken = artifacts.require("OWCToken");
const CourseRegistry = artifacts.require("CourseRegistry");

module.exports = async function (deployer) {
  const owcToken = await OWCToken.deployed();
  await deployer.deploy(CourseRegistry, owcToken.address);
};