import { coreApi, appsApi } from "../utils/kubernetes.js";

export const getCluster = async (req, res) => {
  try {
    const [nodes, pods, services, deployments] = await Promise.all([
      coreApi.listNode(),
      coreApi.listPodForAllNamespaces(),
      coreApi.listServiceForAllNamespaces(),
      appsApi.listDeploymentForAllNamespaces(),
    ]);

    res.status(200).json({
      success: true,
      nodes: nodes.items,
      pods: pods.items,
      services: services.items,
      deployments: deployments.items,
    });
  } catch (err) {
    console.error("Kubernetes Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};