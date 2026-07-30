import { getContainers } from "../utils/docker.js";

export const getDockerContainers = async (req, res) => {
  try {
    const containers = await getContainers();

    res.status(200).json({
      success: true,
      total: containers.length,
      containers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};