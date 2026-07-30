import Docker from "dockerode";

const docker =
  process.platform === "win32"
    ? new Docker({
        socketPath: "//./pipe/docker_engine",
      })
    : new Docker({
        socketPath: "/var/run/docker.sock",
      });

export const getContainers = async () => {
  const containers = await docker.listContainers({ all: true });

  const result = await Promise.all(
    containers.map(async (container) => {
      const inspect = await docker
        .getContainer(container.Id)
        .inspect();

      return {
        id: container.Id.substring(0, 12),
        name: container.Names[0].replace("/", ""),
        image: container.Image,
        state: container.State,
        status: container.Status,
        created: container.Created,
        ports: container.Ports,
        restartCount: inspect.RestartCount,
      };
    })
  );

  return result;
};