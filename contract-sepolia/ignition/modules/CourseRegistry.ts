import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CourseRegistryModule = buildModule("CourseRegistryModule", (m) => {
  // Deploy OWC Token first
  const owcToken = m.contract("OWCToken");
  
  // Deploy CourseRegistry with OWC Token address
  const courseRegistry = m.contract("CourseRegistry", [owcToken]);

  return { owcToken, courseRegistry };
});

export default CourseRegistryModule;