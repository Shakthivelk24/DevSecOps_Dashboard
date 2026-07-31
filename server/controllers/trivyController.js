import { exec } from "child_process";

export const scanImage = (req, res) => {
  const { image } = req.params;
  exec(
    `trivy image --format json ${image}`,
    {
      maxBuffer: 100 * 1024 * 1024,
      timeout: 300000, // 5 minutes
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error("Trivy Error:", error);
        console.error(stderr);

        return res.status(500).json({
          success: false,
          message: stderr || error.message,
        });
      }

      try {
        const result = JSON.parse(stdout);

        return res.json({
          success: true,
          data: result,
        });
      } catch (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: "Failed to parse Trivy output",
        });
      }
    },
  );
};
