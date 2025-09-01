const OWCToken = artifacts.require("OWCToken");

module.exports = function (deployer) {
  deployer.deploy(OWCToken);
};