import axios from "axios";

export const getBuilds = async (req, res) => {
  try {
    const { jobName } = req.params;

    if (!jobName) {
      return res.status(400).json({
        success: false,
        message: "Job name is required",
      });
    }

    const url = `${process.env.JENKINS_URL}/job/${encodeURIComponent(
      jobName
    )}/api/json?tree=builds[number,result,duration,timestamp]`;

    const response = await axios.get(url, {
      auth: {
        username: process.env.JENKINS_USERNAME,
        password: process.env.JENKINS_API_TOKEN,
      },
    });

    const builds = response.data.builds.map((build) => ({
      id: build.number,
      status: build.result || "RUNNING",
      duration: `${Math.floor(build.duration / 60000)}m ${Math.floor(
        (build.duration % 60000) / 1000
      )}s`,
      timestamp: build.timestamp,
    }));

    res.json({
      success: true,
      builds,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch Jenkins builds",
    });
  }
};

export const getPipelineStages = async (req, res) => {
  try {
    const { jobName } = req.params;

    // Get last build number
    const build = await axios.get(
      `${process.env.JENKINS_URL}/job/${jobName}/lastBuild/api/json`,
      {
        auth: {
          username: process.env.JENKINS_USERNAME,
          password: process.env.JENKINS_API_TOKEN,
        },
      }
    );

    const buildNumber = build.data.number;

    // Get pipeline stages
    const stages = await axios.get(
      `${process.env.JENKINS_URL}/job/${jobName}/${buildNumber}/wfapi/describe`,
      {
        auth: {
          username: process.env.JENKINS_USERNAME,
          password: process.env.JENKINS_API_TOKEN,
        },
      }
    );

    res.json({
      success: true,
      stages: stages.data.stages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getConsoleLogs = async (req, res) => {
  try {
    const { jobName } = req.params;

    // Get latest build number
    const build = await axios.get(
      `${process.env.JENKINS_URL}/job/${jobName}/lastBuild/api/json`,
      {
        auth: {
          username: process.env.JENKINS_USERNAME,
          password: process.env.JENKINS_API_TOKEN,
        },
      }
    );

    const buildNumber = build.data.number;

    // Fetch console log
    const logs = await axios.get(
      `${process.env.JENKINS_URL}/job/${jobName}/${buildNumber}/consoleText`,
      {
        auth: {
          username: process.env.JENKINS_USERNAME,
          password: process.env.JENKINS_API_TOKEN,
        },
      }
    );

    res.json({
      success: true,
      logs: logs.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBuildDetails = async (req, res) => {
  try {
    const { jobName } = req.params;

    const response = await axios.get(
      `${process.env.JENKINS_URL}/job/${jobName}/lastBuild/api/json`,
      {
        auth: {
          username: process.env.JENKINS_USERNAME,
          password: process.env.JENKINS_API_TOKEN,
        },
      }
    );

    const build = response.data;

    res.json({
      success: true,
      build: {
        number: build.number,
        result: build.result,
        duration: build.duration,
        timestamp: build.timestamp,
        builtOn: build.builtOn,
        url: build.url,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getArtifacts = async (req, res) => {
  try {
    const { jobName } = req.params;

    const response = await axios.get(
      `${process.env.JENKINS_URL}/job/${jobName}/lastBuild/api/json`,
      {
        auth: {
          username: process.env.JENKINS_USERNAME,
          password: process.env.JENKINS_API_TOKEN,
        },
      }
    );

    const artifacts = response.data.artifacts || [];

    res.json({
      success: true,
      artifacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};