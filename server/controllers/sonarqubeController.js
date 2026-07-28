import axios from "axios";

export const getDashboard = async (req, res) => {
  try {
    const { projectKey } = req.params;

    const response = await axios.get(
      `${process.env.SONARQUBE_URL}/api/measures/component`,
      {
        params: {
          component: projectKey,
          metricKeys:
            "bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc,reliability_rating,security_rating,sqale_rating",
        },
        auth: {
          username: process.env.SONARQUBE_TOKEN,
          password: "",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch SonarQube dashboard",
      error: error.response?.data || error.message,
    });
  }
};