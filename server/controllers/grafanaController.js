import grafanaClient from "../configs/grafana.js";

export const getDashboard = async (req, res) => {
  try {
    const { uid } = req.params;

    const response = await grafanaClient.get(
      `/api/dashboards/uid/${uid}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch Grafana dashboard",
    });
  }
};